Init();

function Init()
{
	let buttonElement = document.querySelector("#connect_button");
	buttonElement.addEventListener('click', function(event) {
		ConnectToDevice();
});
}

function ConnectToDevice()
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

function LogValue(value)
{
	const decoder = new TextDecoder('utf-8');
	console.log(`Decoded: ${decoder.decode(value)}`);
	
	for(let i = 0; i < value.byteLength; i++)
	{
		let currentValue = value.getUint8(i);
		console.log(currentValue);
		console.log(`Characteristic value is ${currentValue}`);
	}
}

function handleValueReceived(event) {
  const value = event.target.value;
  let a = [];
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  console.log('> ' + a.join(' '));
  
  LogValue(value);
}