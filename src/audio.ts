import { spawn } from "child_process";

async function run(command: string, ...args: string[]) {
  const child = spawn(command, args);

  let output = "";

  child.stderr.on("data", (data) => {
    output += data.toString();
  });

  await new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (!code) resolve();
      else reject(new Error(`Failed while running ${command}`));
    });
  });

  return output;
}

async function ffmpeg(...args: string[]): Promise<string> {
  const child = spawn("ffmpeg", args);

  let output = "";

  child.stderr.on("data", (data) => {
    output += data.toString();
  });

  await new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (!code) resolve();
      else reject(new Error(`Failed while running ffmpeg`));
    });
  });

  return output;
}

async function ffprobe(...args: string[]): Promise<string> {
  const child = spawn("ffprobe", args);

  let output = "";

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  await new Promise<void>((resolve, reject) => {
    child.on("exit", (code) => {
      if (!code) resolve();
      else reject(new Error(`Failed while running ffprobe`));
    });
  });

  return output;
}

export async function download(
  inputUrl: string,
  outputFile: string,
  options?: DownloadOptions
) {
  const args: string[] = ["-hide_banner", "-y"];
  if (options?.start) args.push("-ss", options.start);
  if (options?.end) args.push("-to", options.end);
  args.push("-i", inputUrl);
  args.push(outputFile);
  await ffmpeg(...args);
}

export async function loudnorm(
  inputFile: string,
  outputFile?: string,
  loudness?: LoudnormResults
): Promise<LoudnormResults> {
  // Build command
  let cmd = [];
  cmd.push("-hide_banner", "-y");
  cmd.push("-i", inputFile);

  // Build filter
  let filter = "loudnorm=I=-23:LRA=7:tp=-2";
  if (loudness) {
    filter += `:measured_I=${loudness.input_i}:measured_LRA=${loudness.input_lra}:measured_tp=${loudness.input_tp}:measured_thresh=${loudness.input_thresh}`;
  }
  filter += ":print_format=json";
  cmd.push("-af", filter);

  // Add options
  if (outputFile) {
    cmd.push(outputFile);
  } else {
    cmd.push("-f", "null", "-");
  }

  // Run
  const results = await ffmpeg(...cmd);

  // Parse results
  const loudnorm = JSON.parse(results.match(/{[\s\S]*}/)[0]);
  for (const field in loudnorm) {
    if (field !== "normalization_type") {
      loudnorm[field] = Number(loudnorm[field]);
    }
  }
  return loudnorm;
}

export async function probe(file: string): Promise<ProbeResults> {
  const results = await ffprobe(
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    file
  );
  const { format } = JSON.parse(results);
  const { duration, size, bit_rate } = format;
  return { duration, size, bit_rate };
}

interface LoudnormResults {
  input_i: number;
  input_lra: number;
  input_tp: number;
  input_thresh: number;
  output_i: number;
  output_tp: number;
  output_lra: number;
  output_thresh: number;
  normalization_type: string;
  target_offset: number;
}

interface ProbeResults {
  duration: number;
  size: number;
  bit_rate: number;
}

interface DownloadOptions {
  start: string;
  end: string;
}
