# Multi Process Runner
*A simple CLI tool for running multiple processes*

<img src="https://github.com/gabesoft/mpr/raw/master/assets/help.png" />

## Description

Runs multiple processes specified in a [json](https://github.com/gabesoft/mpr/blob/master/test/support/procs_with_comments.json) file.
After some processes have been started any of them can be started/stopped/restarted 
from the same window where they are running or by running another mpr instance. 
Multiple clusters of processes can be run by specifying a port (the same port must 
be used when interacting with the server instance).
For an example of a json file see test/support/procs.json

Here's an example of listing the processes:

<img src="https://github.com/gabesoft/mpr/raw/master/assets/list_procs.png" />

And an example of the processes output:

<img src="https://github.com/gabesoft/mpr/raw/master/assets/procs_output.png" />

Type help in the same window where the processes are running to see the available commands:

<img src="https://github.com/gabesoft/mpr/raw/master/assets/help_inline.png" />

## Requirements

- NPM (http://npmjs.org/)
- Node.js 0.6+ (http://nodejs.org/)

## Install

```
$ npm install mpr -g
```

## License

MIT License

Copyright (C) 2012 Gabriel Adomnicai

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
