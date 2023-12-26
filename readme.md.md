# GENEXPRFW 

GENEXPRFW is a small Node application that enables you to use an external code editor to edit Max Gen~ Codebox code. It takes the form of a file watcher that monitors the specified source code file for changes, massages the code into escaped JSON and then injects the JSON back into the specified Gendsp file. If you have Max running the code will then be automatically compiled.

> **WARNING - USE AT YOUR OWN RISK**
>
>The file watcher modifies the specified Max .gendsp by injecting JSON into it. While testing hasn't thrown up any disastrous error situations there is no undo and no backing up of the original files so please be aware of this and take precautions. In fact if you're just testing this to see if it's for you then make a copy of your project to test it on. 
>
>As part of the development I'd like to add a sort of limited undo by creating a file history but that won't be an immediate consideration.
## Requirements and Installation

#### Requirements
You need the latest version of Node (I haven't done any work establishing the minimum version - I wrote it using Node 21.5.0)

Obviously you need Max and also the code editor of your choice. I use VS Code but there's no reason you can't use any other. One of the reasons I use VS Code is there's an decent GenExpr language add-on for VS Code so that you get syntax highlighting etc (this is not my repository):

https://github.com/larme/GenExprForVSCode

There is also a version of that language file for Sublime Text too: that's where it started life. 
#### Installation

Just one file `genexprfw.js` that needs to be somewhere Node can access it, probably best in the same folder as your Max/Gen project files.
## Usage

### Procedure for Setting Up

* In your Gen~ file, create a Codebox object. Save the Gen~ file.
* In the same folder use an external code editor to create an empty file. The file name can be anything but if you're using the syntax highlight of VS Code or Sublime etc. name it something like `source.gendsp`
* In the Max Codebox editor, copy the entire contents. Paste this into the blank file you just created.
* Open your Gen~ file in and do a text search for "code" - this should find the Codebox object (and it's code) in the Gen~ JSON structure. Get this objects "id" key - it will be something like "obj-10". Make note of that value.
* You should now be able to run the Node file watcher specifying the source text file name, the name of the .gendsp file as saved from your Gen~ patcher and the Codebox object ID.

`node genexprfw.js <source> <output> <code block id>`

Example:

`node genexprfw.js sourceCode.gendsp gendspFile.gendsp obj-8`

`"sourceCode.gendsp"` is the GenExpr file you edit in your external editor`
`"gendspFile.gendsp"` is the Gendsp file the code will be injected into.`
`obj-8` is the JSON ID of the Codebox object in the Gendsp file that will be overwritten by the file watcher

You need to specify all of the arguments and strictly in that order otherwise execution of the Node app will fail (with error messages).

> **Code Block ID**: if you open your (original) .gendsp file in a text editor and scroll through the JSON you'll find a dictionary named "boxes". In that dictionary the "box" objects from your Gen file. Any Codebox objects have a "code" key that contains the Codebox code (as a single line of text!). You'll also see an object ID for that Codebox object. This is what you need to specify in the Node arguments. It's done this way so that if you have multiple Codebox objects in your Gen file you can specify the Codebox you want the file watcher to inject code into.

### Limitations

At initial release there are quite a few limitations and this list is not exhaustive.
#### Inlets and Outlets

If you change the number of inlets or outlets then Max will sort of break your Gen~ object as it has to reconfigure connections based on the number of inlets and outlets. Best thing to do is just avoid changing these in the external code editor and if you have to add/delete any do it within Max/Codebox and then copy-and-paste the new code from the Codebox editor into your external code file.
#### Single File/Codebox

The Node app can only monitor one source code file and you can only inject the code into one Codebox in your Gendsp file.
#### Platforms

I am only able to test on Mac OS X so there may be file system quirks in Windows etc. that mean this doesn't work properly. I'd appreciate input from any Windows users if they have issues and know how to fix/compensate for this in the code.

## Thanks

Thanks to Graham Wakefield for the hints and tips on how this could be made to work.