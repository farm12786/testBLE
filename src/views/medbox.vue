<template>
    <div>
        <v-btn color="success" ref="">Scan QR</v-btn>
        <a href="https://chat-api.one.th/go_api/api/v1/openScanQRcodeWithValue">scan QR</a>
    </div>
</template>

<script>
export default {
  data () {
    return {
      scan_job: null,
      time_scan: 10000,
      scandebug: false,
      scanQRres: null
    }
  },
  methods: {
    Medbox (param) {
      this.logEndpoint = param.logEndpoint
      this.oneID = param.oneID
      alert('OneId == ' + this.oneID)
    },

    MedBoxController (param) {
      return this.MedBox(param)
    },

    oneChatCallBackQRScanner (qrcode) {
      this.openBoxByQRCode(qrcode.toString())
    },

    openBoxByQRCode (qrcode) {
      if (qrcode) {
        let payload = {}
        const data = { boxid: qrcode.toString(), oneid: this.oneid, time: new Date().getTime(), result: 'success' }

        //   alert(ScanQRcodevalue);
        if (qrcode.toLowerCase().startsWith('lys')) {
          payload = { manufacturer_data: '0x' + qrcode.substr(3) }
        } else {
          payload = { name: qrcode }
        }
        this.unlockBLELock(payload)

        this.logtoHTML('Performing BLE scan for' + JSON.stringify(payload))

        console.log(data)
        // this.log(data)
      }
    },
    scanDevice (filter = {}, callback) {
      if (filter.manufacturer_data) {
        this.scan_job.manufacturer_data = filter.manufacturer_data
        if (callback) {
          this.scan_job.callback = callback
        }
      } else if (filter.name) {
        this.scan_job.name = filter.name
        if (callback) {
          this.scan_job.callback = callback
        }
      }
      window.webkit.messageHandlers.scanDevice.postMessage(this.time_scan)
    },

    unlockBLELock (mid) {
      this.scanDevice(mid, function (info) {
        this.logtoHTML(info)

        window.webkit.messageHandlers.OneChat_writeCharacteristicByUUID.postMessage({
          device_uuid: info.uuid,
          service_uuid: 'FF00',
          characteristic_uuid: 'FF01',
          data: '0006CC59513C4CAA6116D34BF71000B12EF8',
          data_type: 'hex'
        })
      })
    },

    oneChatBluetoothCallBackData (type, data) {
    //   const message = ''
      try {
        if (type === 'get_device_service') {
          const obj = JSON.parse(data)

          for (let i = 0; i < obj.data.length; i++) {
            const d = obj.data[i]
            let mfdata = 'N/A'
            let m = {}; let mx

            if (d.manufacturer_data) {
              try {
                mx = d.manufacturer_data.replace(/[{} ]/g, '')
                const arr = mx.split(',')
                for (const c of arr) {
                  const b = c.split('=')
                  m[b[0]] = b[1]
                }

                if (m) {
                  mfdata = m.bytes
                }

                if (this.this.scan_job.manufacturer_data && (this.scan_job.manufacturer_data === mfdata)) {
                  window.webkit.messageHandlers.OneChat_stopScanDevice.postMessage()
                  if (typeof (this.scan_job.callback) === 'function') {
                    this.scan_job.callback({
                      count: i,
                      name: d.bluetooth_name,
                      uuid: d.uuid,
                      manufacturer_data: d.manufacturer_data,
                      state: d.state,
                      rssi: d.rssi
                    })
                    this.clearScanJob()
                  }
                }
              } catch (e) {
                m = 'error'
              }
            } else {
              // logtoHTML('-->'+d.bluetooth_name+'<--<br>');
              if (this.scan_job.name && (this.scan_job.name === d.bluetooth_name)) {
                this.logtoHTML('****** to write --><br>' + JSON.stringify({ type, data }))

                window.webkit.messageHandlers.OneChat_stopScanDevice.postMessage()
                if (typeof (this.scan_job.callback) === 'function') {
                  this.scan_job.callback({
                    round: i,
                    name: d.bluetooth_name,
                    uuid: d.uuid,
                    manufacturer_data: d.manufacturer_data,
                    state: d.state,
                    rssi: d.rssi
                  })
                  this.clearScanJob()
                }
              }
            }
            // message += `
            //     name : ${d.bluetooth_name}<br>
            //     uuid : ${d.uuid}<br>
            //     manufacturer_data : ${mfdata}<br>
            //     state : ${d.state}<br>
            //     rssi : ${d.rssi}<br>
            //     raw : ${d.manufacturer_data}<br>
            //     -----------------------------------------------------<br>
            // `;
          }

          // logtoHTML(message);
        } else {
          if (type !== 'return_once_device' && type !== 'start_scan_bluetooth' && type !== 'write_characteristic_by_uuid' && type !== 'stop_scan_bluetooth') {
            // alert(JSON.stringify({type, data}, undefined, 4));
            this.scandebug = false
            this.logtoHTML(data)
          }
        }
      } catch (error) {

      }
    },
    logtoHTML (input) {
      // alert(input)
      let out = input
      if (typeof (input) === 'object') {
        try {
          out = JSON.stringify(input, undefined, 4)
        } catch (e) {
          alert(e)
        }
      }
      document.getElementById('devicelist').innerHTML = out + '<br>-------------------------------------------------<br>' + document.getElementById('devicelist').innerHTML
    }
  },

  mounted () {
    this.MedBox({ oneID: '', logEndpoint: 'https://053875ec82bc2a4c971bac42f5e900f0.m.pipedream.net' })
  }

}
</script>

<style lang="scss" scoped>

</style>
