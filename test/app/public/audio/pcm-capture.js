class PcmCapture extends AudioWorkletProcessor {
  process() {
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);
