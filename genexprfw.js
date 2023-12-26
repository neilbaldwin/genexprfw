//----------------------------------------------------------------------------
// GENEXPRWF
//
// GenExpr File Watcher, Neil Baldwin December 2023
// Thanks to Graham Wakefield for....well...everything really.
//
// Edit GenExpr (Codebox) code in an external editor.
//
// Monitors changes in a source code file and massages into JSON (escaped stuff)
// and injects it back into your Gen~ file which will then be automatically
// compiled.
// For best results, it seems, lock your Max patcher and don't have the code
// open in the internal Max Codebox editor.
//
//----------------------------------------------------------------------------
// Usage: node genexprfw.js <source file> <gendsp file> <code block id>
//----------------------------------------------------------------------------
//
// <source file> is the code you edit (as you would in Codebox editor)
// <gendsp file> is the .gendsp file that the code will be injected into
// <code block id> is the JSON ID of the Codebox you want to edit externallly
//
// You can find the ID by opening your .gendsp file in a text editor and
// looking for the boxes->box object that contains the <code> key you want
// to edit externally. Only Codebox objects have a <code> key. This is 
// to enable you to have multiple Codebox objects in your Gen~ file while
// targetting a specific Codebox.

// Required Node/JS
const fs = require('fs');
const readline = require('readline');

// Initialise filenames
let sourceFile = ""
let gendspFile = ""
let boxId = ""

//----------------------------------------------------------------------------
// Process arguments
// Argument order is strict. Crude file existence checking but nothing more.
//----------------------------------------------------------------------------

args = process.argv.slice(2);
if (args.length >= 3) {
  sourceFile = args[0];
  gendspFile = args[1];
  boxId = args[2];

  if (!fileExists(sourceFile)) {
    console.error(`Source file ${sourceFile} does not exist.`);
    return 1;
  }

  if (!fileExists(gendspFile)) {
    console.error(`Gendsp file ${gendspFile} does not exist.`);
    return 1;
  }

} else {
  console.error("Not enough arguments.");
  return 1;
}

// Cheap check for existence of specified files
function fileExists(f) {
  try {
    if (fs.existsSync(f)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(`An error occurred trying to read file ${f}: ${err}`);
    return false;
  }
}

//----------------------------------------------------------------------------
// Create file watcher to monitor source code file for changes
//----------------------------------------------------------------------------
fs.watchFile(sourceFile, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log(`${sourceFile} has been modified`);
    const fileStream = fs.createReadStream(sourceFile, 'utf8');

    //Create interface for reading file line by line
    const lineReader = readline.createInterface({
	    input: fileStream,
	    crlfDelay: Infinity // Recognize all instances of CR (\r), LF (\n), or CRLF (\r\n) as line endings
    });
  
    let outputText = ''; // Store the modified text with escaped newlines etc.
  
    //Read the file line by line, massage into escaped output for gendsp code key
    lineReader.on('line', (line) => {
      line = line.replace(/"/g, '\"');   // Replace " with escaped "
      line = line.replace(/\t/g, "\t");	// Replace tab with escaped tab
      line = line.replace(/\n/g, "\\r\\n") + "\r\n"; // Replace newline with escaped newline and add newline
      outputText += line;
    });
  
    //Handle completion or errors
    lineReader.on('close', () => {
      // Open .gendsp file and parse JSON
      fs.readFile(gendspFile, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the file:', err);
          fs.unwatchFile(sourceFile);
          process.exit(0);
      }
      
        // Parse the JSON content
        let jsonData = {};
        try {
          jsonData = JSON.parse(data);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          fs.unwatchFile(sourceFile);
          process.exit(0);
        }
      
        let keys = jsonData["patcher"]["boxes"];
        // Find Boxes->Box->Code key - this is where we inject the code
        for (key in keys) {
          if (keys[key]["box"]["code"] != null) {
            if (keys[key]["box"]["id"] == boxId) {
            } else {
              console.error(`Codebox ID: ${boxId} not found in the Gendsp file. No changes written to ${gendspFile}.`);
              fs.unwatchFile(sourceFile);
              process.exit(0);
            }
            keys[key].box.code = outputText;

            // Convert back to JSON string
            const updatedData = JSON.stringify(jsonData, null, 2); // null and 2 for pretty formatting

            // Write the updated JSON content back to the file
            fs.writeFile(gendspFile, updatedData, 'utf8', (err) => {
              if (err) {
                console.error('Error writing to the file:', err);
                fs.unwatchFile(sourceFile);
                process.exit(0);
                }
              console.log('File updated successfully');
            });
          }
        }
      });
    });
  
    lineReader.on('error', (err) => {
      console.error('Error reading the file:', err);
    });

  }
});

console.log("Monitoring file ${sourceFile} for changes.");
