const sideMargin = 90; // Each side
const imageSize = 1080;

const font = 'Montserrat';
const fontSize = 30;
const lineSpacing = 2;
const paraSpacing = fontSize;

const usableSize = imageSize - sideMargin * 2;

const cvs = $('#cvs')[0];
cvs.width = cvs.height = imageSize;
const ctx = cvs.getContext('2d');
ctx.fillStyle = 'black';

function setFont(bold, italic) {
	var props = italic ? 'italic ' : 'normal ';
	props += 'normal ';
	props += bold ? 'bold ' : '300 ';
	ctx.font = props + fontSize.toString() + 'px ' + font;
}

function parseText(text) {
	var bold = false, italic = false;
	var content = [[false, false, '']];

	for(var i = 0; i < text.length; ++i) {
		var c = text[i];
		if(c == '*' || c == '_' || c == ' ') {
			if(c == '*')
				bold = !bold;
			else if(c == '_')
				italic = !italic;
			content[content.length] = [bold, italic, ''];
		} else
			content[content.length - 1][2] += c;
	}

	return content.filter(x => x[2].length != 0);
}

function parseAll(text) {
	return text.split('\n').map(parseText).filter(x => x.length != 0);
}

function lineify(content) {
	var lines = [];
	var currentLine = [];
	var currentWidth = 0;

	for(var i = 0; i < content.length; i++) {
		var word = content[i];
		setFont(word[0], word[1]);
		var width = ctx.measureText((currentWidth == 0 ? '' : ' ') + word[2]).width;
		if(currentWidth + width <= usableSize) {
			currentLine.push(word);
			currentWidth += width;
		} else {
			lines.push(currentLine);
			currentLine = [word];
			currentWidth = ctx.measureText(word).width
		}
	}
	lines.push(currentLine);
	return lines;
}

function calcHeight(lines) {
	return lines.length * (fontSize + lineSpacing) - lineSpacing;
}

function clear() {
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, cvs.width, cvs.height);
	ctx.fillStyle = 'black';
}

$(document).ready(function() {
	$('body').on('input propertychange', '#text', function() {
		var paras = parseAll($('#text').val()).map(lineify);
		$('#images').empty();
		var icount = 0;

		var height = 0;
		clear();
		function flush() {
			icount++;
			var img = new Image();
			img.src = cvs.toDataURL('image/png');
			img.style.border = '1px solid red';
			$('#images').append(img);
			var a = $('<a download="story' + icount + '.png">Save</a>');
			a[0].href = img.src;
			$('#images').append(a);
			$('#images').append('<br>');
			$('#imagecount').text(icount);
		}
		for(var i = 0; i < paras.length; ++i) {
			var paraLines = paras[i];
			if(height != 0)
				height += paraSpacing;
			var cheight = calcHeight(paraLines);
			if(height + cheight > usableSize) {
				flush();
				height = 0;
				clear();
			}
			for(var j = 0; j < paraLines.length; ++j) {
				var line = paraLines[j];
				var width = 0;
				for(var k = 0; k < line.length; ++k) {
					var word = line[k];
					setFont(word[0], word[1]);
					var cwidth = ctx.measureText((width == 0 ? '' : ' ') + word[2]).width;
					ctx.fillText((width == 0 ? '' : ' ') + word[2], sideMargin + width, sideMargin + height);
					width += cwidth;
				}
				if(height != 0)
					height += lineSpacing;
				height += fontSize;
			}
		}
		if(height != 0)
			flush();
	})
});
