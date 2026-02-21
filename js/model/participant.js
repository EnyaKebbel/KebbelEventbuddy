export default class Participant {
    #id;
    #name;
    #email;
    #avatarUrl;

    constructor({ id, name, email, avatarUrl }) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
        this.#avatarUrl = avatarUrl;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get email() {
        return this.#email;
    }

    get avatarUrl() {
        return this.#avatarUrl;
    }
}