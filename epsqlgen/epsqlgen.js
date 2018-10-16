exports.id = 'epsqlgen';
exports.title = 'EpSqlGen';
exports.group = 'Databases';
exports.color = '#0d5612';
exports.input = 1;
exports.output = ['green', 'red'];
exports.author = 'Miroslav Dubovský';
exports.icon = 'plug-o';

exports.html = `<div class="padding npb">
	<div data-jc="textbox" data-jc-path="path" class="m" data-jc-config="placeholder:@(Type a command to execute EpSqlGen );required:true;maxlength:200;" data-jc-value="''">@(Path to app)</div>
	<div class="help m">@( Samples:   EpSqlGen.exe or c:\\Utils\\EpSqlGen.exe or /\opt/\EpSqlGen ...)</div>
	<div data-jc="textbox" data-jc-path="configfile" data-jc-config="placeholder:@(Type a filename with extension, e.g. Adress.sql);required:true;maxlength:200;" data-jc-value="''">@(SQL or Json config filename)</div>	

</div>`;

exports.readme = `# Database: EpSqlGen

This component executes EpSqlGen in XLSX file generate mode. More https://github.com/dubo/EpSqlGen

__Outputs__:
- Path to generated file is mapped to repository.result.output_file property  

__Input settings__:
- SQL or Json config filename  -  File with SQL select command or Json configuration. Can be repository variable.

__Input params__:
\`\`\`javascript
repository.arguments: [{name : "NumRows", type : "integer", value : 100}, ..], //  SQL arguments   	 
\`\`\`
`;


exports.install = function(instance) {

	var Exec = require('child_process').exec;
	var is = false;
	var dursum = 0;
	var durcount = 0;

	instance.on('data', function(response) {
		var mystart = new Date();	
        var argStr = response.repository.arguments.map(x => '-a' + x.name + ':' + x.type + ':' + x.value.toString()).join(' ');
		Exec((instance.options.path + ' ' + response.arg(instance.options.configfile) ).trim() + ' ' + argStr + ' -dc -do' , function(err, output) {
			if (err)
				instance.send(1, err.toString().trim());
			else {
				//U.extend(response.repository, output.trim().parseJSON(true), true);
				response.repository.result =  output.trim().parseJSON(true) ;
				//set(key, value);
				instance.send(0, response);
				durcount++;
				dursum += ((new Date() - mystart) / 1000).floor(2);	
				setTimeout2(instance.id, instance.custom.duration, 500, 10);
			}
		});
	});

	instance.reconfigure = function() {
		is = instance.options.path ? true : false  ;
		if (is)
			if ( instance.options.configfile  ? true : false )
				instance.status('');
			else 
				instance.status('Config file is not configured.', 'red');	
		else
			instance.status('Path is not configured.', 'red');
	};

	instance.on('service', function() {
		dursum = 0;
		durcount = 0;
	});

	instance.custom.duration = function() {
		var avg = (dursum / durcount).floor(2);
		instance.status(avg + ' sec.');
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};