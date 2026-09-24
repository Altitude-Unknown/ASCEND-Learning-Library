on run args
 set sourceFile to POSIX file (item 1 of args)
 set outputFile to POSIX file (item 2 of args)
 with timeout of 600 seconds
  tell application "Microsoft PowerPoint"
   open sourceFile
   set exportDocument to active presentation
   save exportDocument in outputFile as save as PDF
   close exportDocument saving no
  end tell
 end timeout
end run
