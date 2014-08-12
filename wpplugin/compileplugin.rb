#!/usr/bin/env ruby
#Call the script with the debug arguement to not have google compile the code.
require "net/http"

localdir = File.dirname __FILE__
php = File.open(localdir+"/projectindex.php").read
js = File.open(localdir+"/sort.js").read
js[/GRAYSCALEURL/] = '\\"data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\'><filter id=\\\'grayscale\\\'><feColorMatrix type=\\\'matrix\\\' values=\\\'0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0\\\'/></filter></svg>#grayscale\\"'
compiled = File.new localdir+"/projectindex.compiled.php", "w"
compiled.write php[/.+<EOT/m]+"\n"+js+"\n"+php[/EOT;\n.+/m] #Insert javascript into php
compiled.close
compiled = File.new "/var/www/html/wp-content/plugins/projectindexer.php", "w"
compiled.write php[/.+<EOT/m]+"\n"+js+"\n"+php[/EOT;\n.+/m] #Insert javascript into php
compiled.close
