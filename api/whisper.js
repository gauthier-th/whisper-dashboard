import path from 'path';
import fsSync from 'fs';
import whisper from 'node-whisper';
import { getTranscriptionById, getTranscriptions, updateTranscription } from './database.js';

const maxParallelTranscriptions = parseInt(process.env.MAX_PARALLEL_TRANSCRIPTIONS) || 1;
let runningTranscriptions = [];

const dbFiles = fsSync.existsSync("/config") ? "/config/files" : path.join(path.resolve(), 'files');
if (!fsSync.existsSync(dbFiles)) {
  fsSync.mkdirSync(dbFiles);
}
const whisperModelsDir = fsSync.existsSync("/config") ? "/config/whisper-models" : undefined;
const whisperModel = process.env.WHISPER_MODEL || 'tiny';

export async function browseTranscriptions() {
  // Wait for database to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if we can start a new transcription
  if (runningTranscriptions.length >= maxParallelTranscriptions) {
    return;
  }

  // Get a list of pending transcriptions
  const transcriptions = await getTranscriptions({
    filters: ['status = ?'],
    filterParams: ['pending'],
    limit: maxParallelTranscriptions - runningTranscriptions.length,
    sort: ['created_at', 'ASC'],
  });

  // Process each transcription
  for (const transcription of transcriptions) {
    processTranscription(transcription.id);
  }
}

async function processTranscription(transcriptionId) {
  // Get the transcription
  const transcription = await getTranscriptionById(transcriptionId);
  if (!transcription || transcription.status !== 'pending') {
    return;
  }
  console.log(`[WHISPER] Processing transcription ${transcription.filename}`);

  // Update the transcription status to running
  await updateTranscription({
    id: transcription.id,
    status: 'processing',
  });

  // Add the transcription to the list of running transcriptions
  runningTranscriptions.push(transcription.id);

  // Process the transcription
  let data;
  try {
    data = await whisper(path.join(dbFiles, transcription.path), {
      model: whisperModel,
      language: !transcription.language || transcription.language === 'null' ? undefined : transcription.language,
      output_dir: dbFiles,
      model_dir: whisperModelsDir,
    });
  }
  catch (e) {
    console.error(e);
    await updateTranscription({
      id: transcription.id,
      status: 'error',
    });
    return;
  }

  // Check if the transcription still exists
  if (!await getTranscriptionById(transcription.id)) {
    return;
  }

  // Save the transcription result
  await updateTranscription({
    id: transcription.id,
    status: 'done',
    result: JSON.stringify(Object.keys(data)),
  });

  // Remove the transcription from the list of running transcriptions
  runningTranscriptions = runningTranscriptions.filter(id => id !== transcription.id);

  // Check if we can start a new transcription
  browseTranscriptions();
}
