// utils/sse.js
import Taro from '@tarojs/taro';
import * as TextEncoding from 'text-encoding-shim';

export function eventSource({url, data, onmessage, onerror}) {
  const requestTask = Taro.request({
    url: url,
    enableChunked: true,
    header: {'Content-Type': 'application/json'},
    method: 'POST',
    data: data,
    success: (res) => {
      console.info('发送成功', res)
    },
    fail: (e) => {
      onerror(e)
    }
  })
  
  requestTask.onChunkReceived((response) => {
    const str = new TextEncoding.TextDecoder('utf-8').decode(
      new Uint8Array(response.data)
    )
    onmessage(str)
  })
  
  return requestTask // 返回以便可以中止请求
}