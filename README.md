
```
__     ___    ____
\ \   / / \  / ___|
 \ \ / / _ \ \___ \
  \ V / ___ \ ___) |
   \_/_/   \_\____/
```

# Video Auto Subtitle (VAS)

VAS helps to automatically generate `.srt` subtitle file for video, so you can further adjust and edit it.

## 🤔 The status quo working principle

Utilize [ffmpeg silence detection](http://underpop.online.fr/f/ffmpeg/help/silencedetect.htm.gz#:~:text=Detect%20silence%20in%20an%20audio,duration%20are%20expressed%20in%20seconds.) to get silence parts, then use `sed` and `awk` to extract text data, then `nodejs` process these data and write a `.srt` file for your further customization.

## 🛠 Howt o use

Make sure you have `ffmpeg`, `sed`, `awk` and `nodejs` installed. Clone this repo, run 

```
node dist/index.js -h 
```

to see the help.

Some examples are like:

```
node dist/index.js -v video.mp4
```

then wait some time (very likely not a short time with intensive cpu consumption) and you'll see ``output.srt` under the directory.

