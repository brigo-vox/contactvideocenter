const sdk = VoxImplant.getInstance();
const USERNAME = "brigovideo@videotest.brigo.n9.voximplant.com";
const PASSWORD = "MbzXlc3&"; // Trocar pela senha real
const ACCOUNT_NODE = VoxImplant.ConnectionNode.NODE_9;

let currentCall = null;

// Preenche os dispositivos de mídia
async function listarDispositivos() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const micSelect = document.getElementById("micSelect");
  const camSelect = document.getElementById("cameraSelect");

  micSelect.innerHTML = "";
  camSelect.innerHTML = "";

  devices.forEach((device) => {
    const option = new Option(device.label || device.deviceId, device.deviceId);
    if (device.kind === "audioinput") micSelect.add(option);
    if (device.kind === "videoinput") camSelect.add(option);
  });
}

// Mostra prévia da câmera selecionada
/*async function iniciarPreview() {
  const camId = document.getElementById("cameraSelect").value;
  const constraints = {
    video: { deviceId: camId ? { exact: camId } : undefined },
    audio: false,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const preview = document.getElementById("localvideo");
  preview.srcObject = stream;
}*/

// Login e aguarda chamadas
const login = async () => {
  try {
    await sdk.init({ 
      node: ACCOUNT_NODE , 
      queueType: VoxImplant.QueueTypes.SmartQueue,
      localVideoContainerId: "localvideo", 
      remoteVideoContainerId: "remotevideo" });
    await sdk.connect();
    await sdk.login(USERNAME, PASSWORD);
    console.log("✅ Login realizado");
    const newStatus = "Ready";
      try {
        await sdk.setOperatorACDStatus(VoxImplant.OperatorACDStatuses[newStatus], newStatus);
        console.log("Status atualizado para:", newStatus);
      } catch (e) {
        console.error("Erro ao atualizar status:", e);
      }

    sdk.on(VoxImplant.Events.IncomingCall, (e) => {
    // function for the answer button
      e.call.answer(
          undefined,
          undefined,
          {"sendVideo":true,"receiveVideo":true},
          false,
      )

    // how to process the incoming call events
    e.call.addEventListener(VoxImplant.CallEvents.Connected, (e) => {
        document.getElementById("endcall").onclick = () => {
            e.call.hangup();
        };
        // show the incoming remote video
        // point 4 of the article above
        e.call.on(VoxImplant.CallEvents.EndpointAdded, (e) => {
            // when video is received, show it in the div with ID "remotevideo"
            e.endpoint.on(VoxImplant.EndpointEvents.RemoteMediaAdded, (e) => {
                const container = document.getElementById("remotevideo");
                e.mediaRenderer.render(container);
            });
            e.endpoint.on(VoxImplant.EndpointEvents.RemoteMediaRemoved, (e) => {});
        });
        e.endpoint.on(VoxImplant.EndpointEvents.Removed, (e) => {});

    });

    e.call.addEventListener(VoxImplant.CallEvents.Disconnected, () => {});
    e.call.addEventListener(VoxImplant.CallEvents.Failed, (e) => {});
});

// show the local video
// point 5 of the article above

sdk.showLocalVideo(true);
const streamManager = VoxImplant.Hardware.StreamManager.get();

streamManager.on(VoxImplant.Hardware.HardwareEvents.BeforeMediaRendererRemoved, (e) => {});
streamManager.on(VoxImplant.Hardware.HardwareEvents.MediaRendererRemoved, (e) => {});
streamManager.on(VoxImplant.Hardware.HardwareEvents.MediaRendererAdded, (e) => {
    let localNode = document.getElementById('localvideo');
    e.renderer.render(localNode);
});
streamManager.on(VoxImplant.Hardware.HardwareEvents.MediaRendererUpdated, (e) => {});

  } catch (e) {
    console.error("❌ Erro ao conectar como agente:", e);
  }
};

// Início
document.getElementById("loginBtn").onclick = async () => {
  await listarDispositivos();
  await login();
};
