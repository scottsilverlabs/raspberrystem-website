#!/usr/bin/env ruby
#Call the script with the debug arguement to not have google compile the code.
require "net/http"

localdir = File.dirname __FILE__
php = File.open(localdir+"/projectindex.php").read
js = File.open(localdir+"/sort.js").read
#js[/GRAYSCALEURL/] = ''
debug = ARGV[0] == "debug"
if !debug
	begin #This post request is to have a Google service compress and optimize the code.
	compiledjs = Net::HTTP.post_form(URI.parse("http://closure-compiler.appspot.com/compile"), {"js_code" => js, "output_format" => "text", "output_info" => "compiled_code"})
	js = compiledjs.body
	rescue
	end
end
compiled = File.new localdir+"/projectindex.compiled.php", "w"
compiled.write php[/.+<EOT/m]+"\n"+js+"\n"+php[/EOT;\n.+/m] #Insert javascript into php
compiled.close
compiled = File.new "/var/www/html/wp-content/plugins/projectindexer.php", "w"
compiled.write php[/.+<EOT/m]+"\n"+js+"\n"+php[/EOT;\n.+/m] #Insert javascript into php
compiled.close
