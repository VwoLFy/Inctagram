enum ErrorCodesAny {
  OK = 0,
  NOT_FOUND = 1,
  BAD_REQUEST = 2,
  UNAUTHORIZED = 3,
  FORBIDDEN = 4,
  SERVER_ERROR = 5,
}

export class ResultNotification<T = null> {
  extensions: NotificationExtension[] = []; // array of mistakes
  code = 0; // status code {0 - success, 1 - error}
  data: T | null = null; // data for response

  hasError() {
    return this.code !== 0;
  }

  addError(
    message: string, // message for mistake
    key: string | null = null,
    code: number | null = null, //status code
  ) {
    this.code = code ?? 1;
    this.extensions.push(new NotificationExtension(message, key));
  }

  addData(data: T) {
    this.data = data;
  }
}

export class NotificationExtension {
  constructor(public message: string, public key: string | null) {}
}