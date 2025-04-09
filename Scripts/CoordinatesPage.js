const coordinatesWidth=500;
	const coordinatesHeight=500;
	const margin = 50;

	// variables affected by controls
	var fontSize=18;
	var fromX=-5;
	var toX=10;
	var fromY=-5;
	var toY=10;
	var axisWidth=4;
	var gridWidth=1;
	var showGrid=true;
	var showNumbers=true;
	var showAxisNames=true;
	var gridLineOpacity=1;
	var showTicks=true;
	var gridLineDashArray="none";

	const mainGridElement=document.getElementById("main-grid");
	const gridParentElement=document.getElementById("main-content");
	const templateLineElement=document.getElementById("line-template");
	const templateTextElement=document.getElementById("text-template");
	const templatePolygonElement=document.getElementById("polygon-template");

	templateTextElement.setAttribute("style","font-size:"+fontSize.toString()+"px;");

	document.getElementById("download-button").addEventListener('click', function(){
		const textContent = '<?xml version="1.0" encoding="utf-8"?>'+ gridParentElement.innerHTML;
    		const blob = new Blob([textContent], { type: 'image/svg+xml' });
		const link = document.createElement('a');
		link.download = 'coordinate-system.svg';

	        link.href = window.URL.createObjectURL(blob);
    		document.body.appendChild(link);
    		link.click();
		document.body.removeChild(link);
	});

	// Add event listeners for controls
	document.getElementById("font-size").addEventListener('change', function(){
		fontSize = parseInt(this.value);
		repaintGrid();
	});

	document.getElementById("x-range-from").addEventListener('change', function(){
		fromX = parseInt(this.value);
		repaintGrid();
	});

	document.getElementById("x-range-to").addEventListener('change', function(){
		toX = parseInt(this.value);
		repaintGrid();
	});

	document.getElementById("y-range-from").addEventListener('change', function(){
		fromY = parseInt(this.value);
		repaintGrid();
	});

	document.getElementById("y-range-to").addEventListener('change', function(){
		toY = parseInt(this.value);
		repaintGrid();
	});

	document.getElementById("axis-width").addEventListener('change', function(){
		axisWidth = parseInt(this.value);
		repaintGrid();
	});

	document.getElementById("show-grid").addEventListener('change', function(){
		showGrid = this.checked;
		repaintGrid();
	});

	document.getElementById("show-numbers").addEventListener('change', function(){
		showNumbers = this.checked;
		repaintGrid();
	});

	document.getElementById("show-axis-names").addEventListener('change', function(){
		showAxisNames= this.checked;
		repaintGrid();
	});

	document.getElementById("grid-line-opacity").addEventListener('change', function(){
		gridLineOpacity = this.value;
		repaintGrid();
	});

	document.getElementById("show-ticks").addEventListener('change', function(){
		showTicks = this.checked;
		repaintGrid();
	});

	document.getElementById("grid-line-type").addEventListener('change', function(){
		gridLineDashArray = this.value;
		repaintGrid();
	});

	repaintGrid();
	function repaintGrid(){


	// initial validations
	if (fromX>=toX|| fromY>=toY ||  toY-fromY>50 || toX-fromX>50){
		return;
	}	

	var xTicks=[];
	var yTicks=[];
	var tickLength=Math.round(fontSize/4);

	var duplicated=document.querySelectorAll('.duplicated');
	for (var i=0; i < duplicated.length; i++)
		mainGridElement.removeChild(duplicated[i]);

	// set grid
	mainGridElement.setAttribute("width", (coordinatesWidth+2*margin).toString());
	mainGridElement.setAttribute("height", (coordinatesHeight+2*margin).toString());

	// get tick coordinates
	for (i=0; i <= toX-fromX; i++){
		xTicks[i]=i+fromX;
	}

	for (i=0; i <= toY-fromY; i++){
		yTicks[i]=i+fromY;
	}


	// draw axis
	xAxisPosition=fromY>0?fromY:toY<0?toY:0;
	drawLineInCoordinates(fromX,xAxisPosition,toX,xAxisPosition, axisWidth,'','');	
	xArrowPoints=getArrowPoints(toPrintCoordinates(toX,xAxisPosition),"right");
	drawTriangle(xArrowPoints);

	
	yAxisPosition=fromX>0?fromX:toX<0?toX:0;
	drawLineInCoordinates(yAxisPosition,fromY,yAxisPosition,toY, axisWidth,'','');
	yArrowPoints=getArrowPoints(toPrintCoordinates(yAxisPosition,toY),"up");
	drawTriangle(yArrowPoints);

	if (showAxisNames){
		var endXposition=toPrintCoordinates(toX,xAxisPosition);
		addFormattedText("x",endXposition[0],endXposition[1],"right-double");
		var endYposition=toPrintCoordinates(yAxisPosition,toY);
		addFormattedText("y",endYposition[0],endYposition[1],"top-double");
	}

	// draw x grid, ticks, and numbers
	for (i=0; i<xTicks.length; i++){

		currentX=xTicks[i];
		currentPosition=toPrintCoordinates(currentX,xAxisPosition);

		if (currentX!= fromX&& currentX!=toX){

			if (showGrid)
			drawLineInCoordinates(currentX,fromY,currentX,toY, gridWidth, '',gridLineOpacity);
			
			if(showTicks)
			drawLine(currentPosition[0],currentPosition[1]+tickLength,currentPosition[0],currentPosition[1]-tickLength,axisWidth,'','');
			if(currentX!=0 && showNumbers)
				addFormattedText(currentX.toString(),currentPosition[0],currentPosition[1],"top");
		}
	}

	// draw y grid, ticks, and numbers
	for (i=0; i<yTicks.length; i++){
		currentY=yTicks[i];
		currentPosition=toPrintCoordinates(yAxisPosition,currentY);
			
		if (currentY!= fromY&& currentY !=toY){

			if(showGrid)
			drawLineInCoordinates(fromX,currentY,toX,currentY, gridWidth,'',gridLineOpacity);
			
			if(showTicks)
			drawLine(currentPosition[0]+tickLength,currentPosition[1],currentPosition[0]-tickLength,currentPosition[1],axisWidth,'','');

			if(currentY!=0 && showNumbers)
				addFormattedText(currentY.toString(),currentPosition[0],currentPosition[1],"right");
		}

	}
	}
	

	// helpers
	function duplicateElement(element, newId){
			const newElement=element.cloneNode(true);
			if(newId!="")
				newElement.setAttribute("id",newId);
			else
				newElement.removeAttribute("id");

			newElement.classList.add("duplicated");
			return newElement;
	}
	// add text with some backgroud so that the lines of the coordinates system don't obscures the text
	function addFormattedText(currentText,x,y,position){
		addText(currentText,x,y,position,"stroke-background");
		addText(currentText,x,y,position,"");
	}

	function getArrowPoints(basePosition, orientation){
		const height=fontSize;
		const halfWidth=height/3;
		if (orientation == "up")
			return [basePosition[0]-halfWidth, basePosition[1], basePosition[0]+halfWidth,basePosition[1], basePosition[0], basePosition[1]-height];

		if (orientation == "right")
			return [basePosition[0], basePosition[1]-halfWidth, basePosition[0],basePosition[1]+halfWidth, basePosition[0]+height, basePosition[1]];
		
		return ""; 
	}

	function drawTriangle(trianglePoints){
		const newTriangleElement=duplicateElement(templatePolygonElement, "");
		for (var i=0; i <trianglePoints.length; i++)
			trianglePoints[i]=trianglePoints[i].toFixed(2);

		newTriangleElement.setAttribute("points", trianglePoints.join(" "));
		newTriangleElement.setAttribute("style", 'fill:black');
		mainGridElement.appendChild(newTriangleElement);
	}
	

	function addText(currentText,x,y,position, classes){
			const textElement=duplicateElement(templateTextElement,""); 

			if (position=="top"){
				textElement.setAttribute("dominant-baseline","auto");
				y=y-fontSize/2
			}

			if (position=="top-double"){
				textElement.setAttribute("dominant-baseline","auto");
				y=y-fontSize*1.2
			}

			if (position=="right"){
				textElement.setAttribute("text-anchor","start");
				x=x+fontSize/2;
			}

			if (position=="right-double"){
				textElement.setAttribute("text-anchor","start");
				x=x+fontSize;
			}


			textElement.setAttribute("x",x.toFixed(2));
			textElement.setAttribute("y",y.toFixed(2));
			if (classes!="")
				textElement.classList.add(classes);

			textElement.setAttribute("style", "font-size:" + fontSize + "px");
			textElement.innerHTML=currentText;
			mainGridElement.appendChild(textElement);

			return textElement;
	}

	function toPrintCoordinates(x,y){

		transformationRatio = toX-fromX > toY-fromY? coordinatesWidth/(toX-fromX) : coordinatesHeight/(toY-fromY);
		newX=(x-fromX)*transformationRatio ;
		
		newY=(toY-y)*transformationRatio 

		return [newX+margin,newY+margin];
	}

	function drawLineInCoordinates(fromX,fromY,toX,toY, width,lineColor,lineOpacity){
		fromCoordinates=toPrintCoordinates(fromX,fromY);
		toCoordinates=toPrintCoordinates(toX,toY);
		drawLine(fromCoordinates[0],fromCoordinates[1],toCoordinates[0],toCoordinates[1], width,lineColor,lineOpacity);
	}

	function drawLine(fromX,fromY,toX,toY, width,lineColor,lineOpacity){
		const newLineElement=duplicateElement(templateLineElement, "");

		newLineElement.setAttribute("x1",fromX.toFixed(2));
		newLineElement.setAttribute("y1",fromY.toFixed(2));
		newLineElement.setAttribute("x2",toX.toFixed(2));
		newLineElement.setAttribute("y2",toY.toFixed(2));

		if (lineColor=='') lineColor="black";
		if (lineOpacity=='') lineOpacity=1;
		newLineElement.setAttribute("style", 'stroke:'+lineColor+'; stroke-width:'+width.toFixed(2)+'px; opacity:' + lineOpacity);
		mainGridElement.appendChild(newLineElement);
	}
