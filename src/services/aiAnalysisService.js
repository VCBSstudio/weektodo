/**
 * 调用 AI 分析接口并处理流式响应
 * @param {object} payload - 请求体数据
 * @param {function} onChunk - 接收到数据块时的回调函数，参数为解析出的文本
 * @param {AbortSignal} signal - 用于中止 fetch 请求的 AbortSignal
 * @returns {Promise<boolean>} - 返回一个Promise，当接收到 'Done' 信号时 resolve(true)，表示成功结束。
 */
export async function fetchAIAnalysisStream(payload, onChunk, signal) {
  try {
    const url = 'http://test.api.ai.ixieju.com/ai_web/chat/completion';
    const headers = {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      signal: signal,
    });
    
    if (!response.ok) {
      // async/await 会自动将抛出的错误转换为 rejected promise
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }
    
    const decoder = new TextDecoder('utf-8');
    
    for await (const chunk of response.body) {
      if (signal?.aborted) {
        console.log('Stream reading was aborted by signal.');
        return false; // 返回 false 表示非 "Done" 结束
      }
      
      const decodedChunk = decoder.decode(chunk, { stream: true });
      const lines = decodedChunk.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine === 'data: Done') {
          console.log("Stream finished with 'Done' signal.");
          return true; // 正常结束，返回 true
        }
        
        if (trimmedLine.startsWith('data: ')) {
          const jsonString = trimmedLine.substring(6);
          if (jsonString) {
            try {
              const parsedData = JSON.parse(jsonString);
              if (parsedData?.data?.flag === 'answer') {
                const textChunk = parsedData.data?.data?.content;
                if (textChunk) {
                  onChunk(textChunk);
                }
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    }
    
    // 如果循环正常结束但没有收到'Done'，也认为是成功完成
    console.warn("Stream ended without 'Done' signal.");
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户主动取消，不算作是一个错误，静默处理
      console.log('Fetch was aborted by the user.');
      // 返回一个 resolved 的 Promise，值为 false
      return Promise.resolve(false);
    } else {
      // 其他错误，向上抛出，这将使调用方的 catch 块捕获到它
      console.error('调用 AI 分析接口时出错:', error);
      throw error;
    }
  }
}