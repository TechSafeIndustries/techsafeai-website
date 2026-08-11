export class NoopNotificationAdapter {
  constructor() {
    this.kind = 'not-configured';
  }

  async notify() {
    return { attempted: false, delivered: false, status: 'NOT_CONFIGURED' };
  }
}

export class RecordingNotificationAdapter {
  constructor({ fail = false } = {}) {
    this.kind = 'recording-test';
    this.fail = fail;
    this.notifications = [];
  }

  async notify(message) {
    this.notifications.push(message);
    if (this.fail) return { attempted: true, delivered: false, status: 'FAILED' };
    return { attempted: true, delivered: true, status: 'DELIVERED' };
  }
}
