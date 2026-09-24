on run args
 set sourcePath to item 1 of args
 set outputPath to item 2 of args
 with timeout of 600 seconds
  tell application "Microsoft Word"
   open file name sourcePath read only true add to recent files false
   set exportDocument to active document
   save as exportDocument file name outputPath file format format PDF
   close exportDocument saving no
  end tell
 end timeout
end run
