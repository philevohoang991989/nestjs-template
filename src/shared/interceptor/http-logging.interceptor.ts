import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { maskJSON2 } from 'maskdata';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = uuidv4();
    const { method, originalUrl, params, query, ip } = request;
    let body = request.body;
    const userAgent = request.headers['user-agent'];
    const referer = request.headers['referer'];

    const maskOptions = {
      passwordFields: ['password'],
    };
    body = maskJSON2(body, maskOptions);

    Logger.log(
      JSON.stringify({
        requestId,
        method,
        originalUrl,
        params,
        query,
        ip,
        userAgent,
        referer,
        body,
      }),
      'HTTP Incoming',
    );

    return next.handle().pipe(
      tap((data) => {
        data = maskJSON2(data, maskOptions);
        Logger.log(JSON.stringify({ requestId, data }), 'HTTP Response');
      }),
    );
  }
}
