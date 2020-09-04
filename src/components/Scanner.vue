<template>
  <div id="dwtContainer">
    <!-- <div id="dwtcontrolContainer"></div> -->
    <Viewer :id="viewer.viewerId" :width="viewer.width" :height="viewer.height"/>
    <v-tabs>
      <v-tab :key="0">Scan</v-tab>
      <v-tab :key="1">Camera Capture</v-tab>
      <v-tab :key="2">Barcode Decode</v-tab>
      <v-tab-item :key="0">114514</v-tab-item>
      <v-tab-item :key="1">1919810</v-tab-item>
      <v-tab-item :key="2">
        <div id="barcode-board">
        <p><strong>Barcode Reader</strong></p>
        <button @click="decodeImage">Decode</button>
      </div>
      </v-tab-item>
    </v-tabs>
    <div id="dwtcontrolPanel">      
      <div id="control-panel">
        <p>Source</p>
        <button @click="acquireImage">Scan</button>
        <button @click="loadImage">Load</button>
        <br />
        <p>Quick Edit</p>
        <div size="sm">
          <button @click="rotateImage(-1)">Rotate Left</button>
          <button @click="rotateImage(1)">Rotate Right</button>
          <button @click="mirrorImage()">Mirror</button>
          <button @click="flipImage()">Flip</button>
        </div>
        <br />
        <button @click="openImageEditor">Edit</button>
      </div>
      <div id="io-board">
        <label for="postfix-editor">File Name: </label>
        <input id="postfix-editor" v-model="fileIO.fileName" >
        <label for="format-selector">Format Selector</label>
        <select id="format-selector" v-model="fileIO.selectedFormat">
          <option v-for="(format, idx) in fileIO.fileFormat" :key="idx" :value="format">{{ format }}</option>
        </select>
        <button @click="saveFile">Save</button>
      </div>
      <div id="video-camera-board">
        <p><strong>Web Camera Options</strong></p>
        <label for="camera-selector">Webcam Source:</label>
        <select id="camera-selector" v-model="videoCamera.activatedCamera">
          <option
            v-for="(camera, idx) in videoCamera.sources"
            :key="idx"
            :value="camera"
            >{{ camera }}</option
          >
        </select>
        <button @click="switchViews">Toggle Camera LV</button>
        <br>
        <!-- Resolution selector -->
        <label for="resolution-select">Resolution</label>
        <select id="resolution-select" v-model="videoCamera.selectedResolution">
          <option v-for="(res, idx) in videoCamera.resolution" :key="idx" :value="res">{{ res }}</option>
        </select>
        <!-- Frame rates selector -->
        <label for="framerate-select">Frame Rates</label>
        <select id="framerate-select" v-model="videoCamera.selectedRate">
          <option v-for="(rate, idx) in videoCamera.frameRates" :key="idx" :value="rate">{{ rate }}</option>
        </select>
        <!-- Media Type selector -->
        <label for="type-select">Media Type</label>
        <select id="mediatype-select" v-model="videoCamera.selectedType">
          <option v-for="(type, idx) in videoCamera.mediaType" :key="idx" :value="type">{{ type }}</option>
        </select>
        <!-- Rotation selector -->
        <label for="rotate-select">Rotation</label>
        <select id="rotate-select" v-model="videoCamera.selectedRotation">
          <option v-for="(rotateVal, rotateKey) in videoRotateMode" :key="rotateVal" :value="rotateVal">{{ rotateKey }}</option>
        </select>
        <button @click="updateVideoCameraSetting">Apply</button>
        <button @click="captureImage">Capture</button>
      </div>
      
    </div>
  </div>
</template>

<script>
import dwt from "dwt";
import Viewer from '@/components/Viewer.vue'

export default {
  name: "dwt",
  components: {
    Viewer
  },
  data() {
    return {
      dwtInstance: null,
      dwtId: 'dwtObject',
      licenseKey: "t01016QAAADyBe7yfb9oPaRKoDodUi2D6w3Dj/XeSforvLiBX6PXItwyqx3NL/4Uso1U/t4Gol58RCjB9B1q+RjxJ2qOVHa1eGzRmGbzga3PGGn1/tDAWpk/DKsyhQmO9F1PDDdxIL+c=",
      barcodeReader: null,
      videoCamera: {
        obj: null,
        sources: [],
        activatedCamera: null,
        isVideoOn: false,
        frameRates: [],
        selectedRate: 0,
        mediaType: [],
        selectedType: '',
        resolution: null,
        selectedResolution: '',
        selectedRotation: 0
      },
      viewer: {
        viewerId: 'dwtViewer',
        viewerObj: null,
        selectedIndex: 0,
        width: 400,
        height: 600
      },
      fileIO: {
        fileName: '',
        selectedFormat: 'JPEG',
        fileFormat: ['JPEG', 'PNG', 'TIFF', 'BMP', 'PDF']
      }
    };
  },
  // Computed properties would be set only when their reference use it.
  computed: {
    selectedCamera() {
      return this.videoCamera.activatedCamera;
    },
    isEditorOpen() {
      return this.$store.state.isEditorOpen;
    },
    videoRotateMode() {
      /** 
       * VRM_NONE: 0
       * VRM_90_DEGREES_CLOCKWISE: 1
       * VRM_180_DEGREES_CLOCKWISE: 2
       * VRM_270_DEGREES_CLOCKWISE: 3
       * VRM_FLIP_VERTICAL: 4
       * VRM_FLIP_HORIZONTAL: 5
      */
     let rotateMode = dwt.EnumDWT_VideoRotateMode
     const rotation = {
       'OFF': rotateMode.VRM_NONE,
       'CLOCKWISE 90°': rotateMode.VRM_90_DEGREES_CLOCKWISE,
       'CLOCKWISE 180°': rotateMode.VRM_180_DEGREES_CLOCKWISE,
       'CLOCKWISE 270°': rotateMode.VRM_270_DEGREES_CLOCKWISE,
       'FLIP VERTICAL': rotateMode.VRM_FLIP_VERTICAL,
       'FLIP HORIZONTAL': rotateMode.VRM_FLIP_HORIZONTAL
     }
      return rotation
    }
  },
  watch: {
    selectedCamera() {
      this.updateVideoCameraOptions()
    }
  },
  mounted() {
    this.initDwtObj()
    .then(() => {
      console.log(dwt.WebTwainEnv.GetWebTwainEx(this.dwtId))
      this.initDwtViewer()
      // Update webcam list
      this.setupVideoCamera()
      this.barcodeReader = this.dwtInstance.Addon.BarcodeReader
      window.dwtObj = this.dwtInstance
    })
    window.dwt = dwt;
  },
  methods: {
    unmountDwtObj: function () {
        return new Promise((res, rej) => {
        // Before initialization, unmount all the instances
        if (dwt.WebTwainEnv.DeleteDWTObject(this.dwtId)) { console.log(true);res(true); }
        else { rej(false) }
      })
    },
    initDwtObj: function () {
      return new Promise((res, rej) => {
        this.unmountDwtObj()
        .then(() => {
          let checkScript = () => {
              // Initialize the reference of dwtInstance actively.
              dwt.WebTwainEnv.UseLocalService = true;
              dwt.WebTwainEnv.ResourcesPath = "resources/dwt";
              dwt.WebTwainEnv.ProductKey = this.licenseKey
              dwt.WebTwainEnv.AutoLoad = false;
              dwt.WebTwainEnv.Containers = [];
              dwt.WebTwainEnv.IfAddMD5InUploadHeader = false;
              dwt.WebTwainEnv.IfConfineMaskWithinTheViewer = false;
              // dwt.WebTwainEnv.Load()
              let dwtConfig = { WebTwainId: this.dwtId }
              // By default, use local service is true
              dwt.WebTwainEnv.CreateDWTObjectEx(
                    dwtConfig, 
                    (dwtObject) => { window.console.log('111'); this.dwtInstance = dwtObject; res();},
                    (errStr) => { console.log(`failed to initialize dwt, message: ${errStr}`); rej(errStr);}
              )
          }
          setTimeout(() => checkScript(), 100)
        })
      })
    },
    initDwtViewer: function () {
      if (this.dwtInstance === null)  { alert('WebTwain Object has not been initialized yet.') }
      else {
        const dwtObj = this.dwtInstance
        let viewOptions = { 
          width: this.viewer.width, 
          height: this.viewer.height, 
          view: {
            bShow: true,
            Width: '100%'
          } 
        }
        if (dwtObj.BindViewer(this.viewer.viewerId, viewOptions)) {
          // Register OnClick for viewer
          this.dwtInstance.RegisterEvent('OnMouseClick', (idx) => { this.viewer.selectedIndex = idx })
          this.viewer.viewerObj = this.dwtInstance.Viewer
          this.viewer.viewerObj.ShowPageNumber = true
        }
      }
    },
    acquireImage: function() {
      const DWObject = this.dwtInstance;
      if (DWObject) {
        if (DWObject.UseLocalService) {
          DWObject.SelectSource(
            function() {
              var OnAcquireImageSuccess = function() {
                DWObject.CloseSource();
              };
              var OnAcquireImageFailure = function() {
                DWObject.CloseSource();
              };
              DWObject.OpenSource();
              DWObject.IfDisableSourceAfterAcquire = true;
              DWObject.AcquireImage(
                OnAcquireImageSuccess,
                OnAcquireImageFailure
              );
            },
            function() {
              console.log("SelectSource failed");
            }
          );
        } else {
          DWObject.LoadImageEx("", -1);
        }
      }
    },
    captureImage: function () {
      const webcam = this.dwtInstance.Addon.Webcam
      if (this.videoCamera.isVideoOn) { this.switchViews(false) }
      webcam.CaptureImage(
        () => { console.log('captured successfully') }, 
        (errCode, errStr) => { console.error(`error code: ${errCode}, ${errStr}`) }
      )
    },
    decodeImage: function () {
      this.barcodeReader.decode(this.viewer.selectedIndex)
      .then((textResult) => {
        console.log(textResult)
        if (textResult.length !== 0) {
          for (let i = 0; i < textResult.length; i++)
          console.log(`${i}: ${textResult[i].barcodeText}`)
        }
      })
    },
    loadImage: function() {
      const DWObject = this.dwtInstance;
      DWObject.IfShowFileDialog = true;
      DWObject.LoadImageEx("", dwt.EnumDWT_ImageType.IT_ALL);
    },
    openImageEditor: function() {
      const DWObject = this.dwtInstance;
      new Promise((resolve, reject) => {
        if (DWObject) {
          DWObject.ShowImageEditor();
          let editorDom = null;
          setTimeout(() => {
            try {
              editorDom = document.getElementsByClassName("D_ImageUIEditor")[0];
              // this.$store.dispatch("changeEditorOpen", true);
              resolve(editorDom);
            } catch (ex) {
              reject();
            }
          }, 200);
        } else {
          reject();
        }
      })
        // .then(resolve => {

        // })
      .catch((reject) => {
        console.error(reject);
      });
    },
    rotateImage: function(direction) {
      const DWObject = this.dwtInstance;
      switch (direction) {
        case -1:
        case "-1": {
          DWObject.Rotate(this.viewer.selectedIndex, -90, true);
          break;
        }
        case 1:
        case "1": {
          DWObject.Rotate(this.viewer.selectedIndex, 90, true);
          break;
        }
      }
    },
    flipImage: function() {
      const DWObject = this.dwtInstance;
      DWObject.Flip(this.viewer.selectedIndex);
    },
    mirrorImage: function() {
      const DWObject = this.dwtInstance;
      DWObject.Mirror(this.viewer.selectedIndex);
    },
    updateVideoCameraOptions: function () {
      const dwtobj = this.dwtInstance;
      const webcam = dwtobj.Addon.Webcam;
      webcam.StopVideo();
      webcam.SelectSource(this.videoCamera.activatedCamera);

      function ObjToArr(obj) {
        let count = obj.GetCount()
        let arr = []
        for (let i = 0; i < count; i++) { arr.push(obj.Get(i)) }
        return arr
      }

      // Use promise to guarantee the array data has been parsed
      new Promise((res) => {
        this.videoCamera.frameRates = ObjToArr(webcam.GetFrameRate());
        this.videoCamera.resolution = ObjToArr(webcam.GetResolution());
        this.videoCamera.mediaType = ObjToArr(webcam.GetMediaType());
        res()
      })
      .then(() => {
        // Set default value
        this.videoCamera.selectedRate = this.videoCamera.frameRates[0];
        this.videoCamera.selectedResolution = this.videoCamera.resolution[0];
        this.videoCamera.selectedType = this.videoCamera.mediaType[0];
      })
    },
    setupVideoCamera: function () {
      if (dwt.Lib.detect.ssl) {
        this.dwtInstance.IfSSL = true
        this.dwtInstance.HTTPPort = 443
      }
      const webcam = this.dwtInstance.Addon.Webcam;
      this.videoCamera.sources = webcam.GetSourceList();
      this.updateVideoCameraSetting()
    },
    saveFile: function () {
      let fileName = this.fileIO.fileName
      let index = this.viewer.selectedIndex
      let format = this.fileIO.selectedFormat
      let onSaveSuccess = function () { alert(`${fileName} saved successfully`) }
      let onSaveFailure = function (errCode, errStr) { alert(`${fileName} saved failed. Code ${errCode}, ${errStr}`) }
      switch (format) {
        case 'JPEG': { this.dwtInstance.SaveAsJPEG(fileName, index, onSaveSuccess, onSaveFailure); break; }
        case 'PNG': { this.dwtInstance.SaveAsPNG(fileName, index, onSaveSuccess, onSaveFailure); break; }
        case 'PDF': { this.dwtInstance.SaveAsPDF(fileName, index, onSaveSuccess, onSaveFailure); break; }
        case 'TIFF': { this.dwtInstance.SaveAsTIFF(fileName, index, onSaveSuccess, onSaveFailure); break; }
        case 'BMP': { this.dwtInstance.SaveAsBMP(fileName, index, onSaveSuccess, onSaveFailure); break; }
      }
    },
    updateVideoCameraSetting: function () {
      const webcam = this.dwtInstance.Addon.Webcam;
      if (this.isVideoOn) { webcam.StopVideo() }
      webcam.SetFrameRate(this.videoCamera.selectedRate);
      webcam.SetMediaType(this.videoCamera.selectedType);
      webcam.SetResolution(this.videoCamera.selectedResolution);
      webcam.SetVideoRotateMode(this.videoCamera.selectedRotation);
      if (this.isVideoOn) { webcam.PlayVideo(this.dwtInstance, 80, () => {}) }
    },
    setVideoPlayback: function(bShow) {
      const webcam = this.dwtInstance.Addon.Webcam;
      if (bShow) {
        webcam.StopVideo();
        setTimeout(() => {
          // PlayVideo(DWObject, nQuality, onFrameCaptured)
          webcam.PlayVideo(this.dwtInstance, 80, () => {
            
          });
          this.videoCamera.isVideoOn = true;
        }, 30);
      } else {
        this.dwtInstance.Addon.Webcam.StopVideo();
        this.videoCamera.isVideoOn = false;
      }
    },
    switchViews: function() {
      if (this.videoCamera.isVideoOn) {
        this.setVideoPlayback(false);
      } else {
        this.setVideoPlayback(true);
      }
    },
  },
};
</script>

<style scoped>
#dwtContainer {
  display: flex;
}
#dwtContainer > * {
  margin: 0px 1rem;
}
#dwtcontrolContainer {
  width: 50vw;
  height: 600px;
}
#control-panel > * {
  margin-bottom: 8px;
}
/* Temporary style */
button {
  box-sizing: border-box;
  border: 0 solid transparent;
  border-radius: 4px;
  background-color: rgb(0, 131, 207);
  color: white;
  font-weight: 500;
  padding: 0.6rem 1.2rem;
  margin-right: 8px;
}
button:hover {
  box-sizing: border-box;
  border: 0 solid transparent;
  background-color: rgb(0, 102, 161);
  cursor: pointer;
}
button:active {
  border: 0 solid transparent;
}
button:visited {
  border: 0 solid transparent;
}
</style>

<style>
.D_ImageUIEditor {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 32px 48px;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
}
</style>
