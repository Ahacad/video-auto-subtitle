// index.ts
var execSync = require("child_process").execSync;
var exec = require("child_process").exec;
var fs = require("fs");
var { Command } = require("commander");
var program = new Command();
program.option("-v, --video <videoname>", "video name to process", "video.mp4").option("-f, --file <filename>", "output srt file name", "output").option("-s, --sound <dbvalue>", "db value for silence", "-30dB").option("-d, --duration <duration>", "silence duration for detection", "0.2").option("--debug", "debug mode").parse(process.argv);
var options = program.opts();
function get_srt_format_time(origintime = "") {
  let time = Number(origintime.split(".")[0]);
  const hour = Math.floor(time / 3600);
  const minute = Math.floor((time - hour * 3600) / 60);
  const second = time - hour * 3600 - minute * 60;
  let millisecond = origintime.split(".")[1];
  if (millisecond == void 0)
    millisecond = "000";
  if (millisecond.length > 3) {
    millisecond = millisecond.substring(0, 3);
  } else {
    millisecond = millisecond.padEnd(3, "0");
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")},${millisecond}`;
}
function generate_srt(silence_starts, silence_ends, filename) {
  "generate srt file from silence_starts and silence_ends";
  let cnt = 0;
  let output = "";
  const len = silence_starts.length - 1;
  if (Number(silence_starts[0]) !== 0) {
    cnt++;
    output += `${cnt}
`;
    output += `00:00:00,000 --> ${get_srt_format_time(silence_starts[0])}
`;
    output += "\n";
    output += "\n";
  }
  for (let i = 1; i < len; i++) {
    const start = get_srt_format_time(silence_ends[i - 1]);
    const end = get_srt_format_time(silence_starts[i]);
    cnt++;
    output += `${cnt}
`;
    output += `${start} --> ${end}
`;
    output += "\n";
    output += "\n";
  }
  cnt++;
  output += `${cnt}
`;
  output += `${get_srt_format_time(silence_ends[len - 1])} --> 05:00:00,000
`;
  output += "\n";
  output += "\n";
  fs.writeFileSync(`./${filename}.srt`, output);
}
console.log("Start processing...");
var out1 = exec(`ffmpeg -i '${options.video}' -af silencedetect=noise=${options.sound}:d=${options.duration} -f null -`, function(error, stdout, stderr) {
  fs.writeFileSync("tmp.txt", stderr.toString());
  console.log("Ffmpeg finished, now generating srt file...");
  const output1 = execSync("sed -i 's/\\r/\\n/g' tmp.txt");
  const silencestarts = execSync("awk '/silence_start/ {print $5}' tmp.txt").toString();
  const silenceends = execSync("awk '/silence_end/ {print $5}' tmp.txt").toString();
  let silence_starts = silencestarts.split("\n");
  let silence_ends = silenceends.split("\n");
  generate_srt(silence_starts, silence_ends, options.file);
  console.log("Srt file generated.");
  if (!options.debug) {
    fs.unlinkSync("tmp.txt");
  } else {
    let debug_info = "";
    debug_info += "silence_starts:\n";
    debug_info += silence_starts.toString();
    debug_info += "\n";
    debug_info += "silence_ends:\n";
    debug_info += silence_ends.toString();
    debug_info += "\n";
    fs.writeFileSync("debug.info", debug_info);
  }
});
