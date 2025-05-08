import express, { Request, Response, NextFunction } from 'express';
import { asyncWrapper } from './utils/asyncWrapper';
import { pipeWithErrorHandler } from './utils/streamErrorHandler';

const app = express();

// Mock function for demo
function getSomeGCSFile(shouldError: boolean) {
  const { Readable } = require('stream')
  if (shouldError) {
    // 會 emit error 的 stream
    const stream = new Readable({
      read() {
        this.emit('error', new Error('stream error 測試'))
      }
    })
    return {
      createReadStream: () => stream
    }
  } else {
    // 正常回傳資料
    return {
      createReadStream: () => Readable.from(['Hello World'])
    }
  }
}

// 同步錯誤
app.get('/sync-error', (req: Request, res: Response) => {
  throw new Error('同步錯誤');
});

// 非同步錯誤
app.get('/async-error-4', asyncWrapper(async (req: Request, res: Response) => {
  throw new Error('async/await 錯誤, Express 4.x 以下的寫法');
}));

// 非同步錯誤
app.get('/async-error', async (req: Request, res: Response) => {
  throw new Error('async/await 錯誤');
});

// stream error
app.get('/file', asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const file = getSomeGCSFile(true);
  pipeWithErrorHandler(file.createReadStream(), res, next);
}));

// 沒有處理 stream error，網站會 Crash
app.get('/file-no-handle', asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const file = getSomeGCSFile(true);
  file.createReadStream().pipe(res);
}));

// 錯誤 middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

app.listen(3000, () => {
  console.log('Server started');
});