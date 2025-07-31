const sdk = VoxImplant.getInstance();
const ACCOUNT_NODE = VoxImplant.ConnectionNode.NODE_9;
const USERNAME = "Usuario_Teste@videotest.brigo.n9.voximplant.com";
const PASSWORD = "#Aiud0Gx";

let currentCall = null;

// Preencher opções de dispositivos
async function listarDispositivos() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const camSelect = document.getElementById("cameraSelect");
  const micSelect = document.getElementById("micSelect");

  camSelect.innerHTML = "";
  micSelect.innerHTML = "";

  devices.forEach((device) => {
    const option = new Option(device.label || device.deviceId, device.deviceId);
    if (device.kind === "videoinput") camSelect.add(option);
    if (device.kind === "audioinput") micSelect.add(option);
  });
}

// Iniciar prévia da câmera
async function iniciarPreview() {
  const camId = document.getElementById("cameraSelect").value;
  const constraints = {
    video: { deviceId: camId ? { exact: camId } : undefined },
    audio: false,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  document.getElementById("preview").srcObject = stream;
}

// Iniciar chamada
const startcall = () => {
    // prepare settings
    const callSettings = {
        number: "client",
        video: {
            sendVideo: true,
            receiveVideo: true
        }
    };

    // start the call
    const call = sdk.call(callSettings);

    // subscribe to the events if necessary
    call.addEventListener(VoxImplant.CallEvents.Connected, () => {
        console.log("Call connected!");
    });

    call.addEventListener(VoxImplant.CallEvents.Disconnected, () => {
        console.log("Call disconnected!");
    });
    
    call.addEventListener(VoxImplant.CallEvents.Failed, (e) => {
        console.log("Call failed!", e);
    });
};

// Login anônimo e iniciar
document.getElementById("login").onclick = async () => {
  await listarDispositivos();
  await iniciarPreview();

  await sdk.init( {node: ACCOUNT_NODE , queueType: VoxImplant.QueueTypes.SmartQueue});
  await sdk.connect();
  await sdk.login(USERNAME, PASSWORD);
  const newStatus = "Ready";
      try {
        await sdk.setOperatorACDStatus(VoxImplant.OperatorACDStatuses[newStatus], newStatus);
        console.log("Status atualizado para:", newStatus);
      } catch (e) {
        console.error("Erro ao atualizar status:", e);
      }
document.getElementById("startCallBtn").onclick = async () => {
  startcall();}
};
