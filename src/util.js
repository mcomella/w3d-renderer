export function assert(statement, msg) {
    if (!statement) {
        if (!msg) {
            msg = '';
        }
        throw `assertion failure: ${msg}`;
    }
}
