let chart;
let xValues = [];
let yValues = [];
let gattCharacteristic;

Init();

function Init()
{
	const ctx = document.getElementById('ecg_chart').getContext('2d');
    const data = {
        labels: xValues,
    datasets: [{
        label: 'ECG 01',
        data: yValues,
        borderColor: 'rgb(75, 192, 192)',
		cubicInterpolationMode: 'monotone',
    }]
    };
    const config = {
        type: 'line',
        data: data
      };
    chart = new Chart(ctx, config);
    chart.options.animation = false;
    chart.options.animations.colors = false;
    chart.options.transitions.active.animation.duration = 0;   
}

function Connect()
{

	navigator.bluetooth.requestDevice({
	  filters: [{
		services: [0xFFE0]
	  }]
	})
	.then(device => {
		console.log("Connecting to gatt server");
		let gattServer = device.gatt.connect();
		console.log("Connected to gatt server");
		
		return gattServer;
	})
	.then(server => {
	  console.log("Retrieving primary service 0xFFE0");
	  return server.getPrimaryService(0xFFE0);
	})
	.then(service => {
	  console.log("Retrieving characteristic 0xFFE1");
	  return service.getCharacteristic(0xFFE1);
	})
	.then(characteristic => {
		gattCharacteristic = characteristic;
		characteristic.startNotifications().then(_ => {
		  console.log('Subscribed characteristicvaluechanged');
		  characteristic.addEventListener('characteristicvaluechanged',
		  handleValueReceived);
		});
	})
	.catch(error => { 
	alert("Error occured");
	console.log(error); 
	});
}

function handleValueReceived(event) {
  const value = event.target.value;
  //const decoder = new TextDecoder('utf-8');
  //const decodedValue = decoder.decode(value);  
  console.log(value.byteLength);
  //const yValue = Number(decodedValue);  
  for(let i = 0; i < value.byteLength; i+= 4)
  { 
	const yValue = value.getUint32(i); 
	const xValue = (new Date()).getMilliseconds();
	xValues.push(xValue);
    yValues.push(yValue);

    if(xValues.length > 100)
    {
        xValues.shift();
        yValues.shift();
    }
  }
  //const yValue = value.getUint32(0); 
  //console.log("X: " + xValue + " Y: " + yValue);
  //UpdateChart(xValue, yValue);

    chart.update();
}


function Disconnect()
{
	if(!gattCharacteristic)
	{
		return;
	}
	
    gattCharacteristic.removeEventListener('characteristicvaluechanged', handleValueReceived);
}

function UpdateChart(nextX, nextY)
{
    xValues.push(nextX);
    yValues.push(nextY);

    if(xValues.length > 100)
    {
        xValues.shift();
        yValues.shift();
    }

    chart.update();
}