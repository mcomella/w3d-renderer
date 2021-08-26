export function assert(statement, msgProvider) {
    if (!statement) {
        const msg = msgProvider ? msgProvider() : 'no description provided';
        throw `assertion failure: ${msg}.`;
    }
}
