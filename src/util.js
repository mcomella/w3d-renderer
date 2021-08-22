export function assert(statement, msg) {
    if (!statement) {
        if (!msg) {
            msg = '';
        }
        throw Exception(`assertion failure: ${msg}`);
    }
}
