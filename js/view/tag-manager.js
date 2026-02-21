import { model } from "../model/model.js";

class TagManager extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        model.addEventListener("tagsChanged", () => this.render());
        model.addEventListener("eventsChanged", () => this.render());
        this.render();
    }

    render() {
        const tags = [...model.tags.values()];

        const tagsHtml = tags
            .map((t) => {
                const used = model.isTagUsed ? model.isTagUsed(t.id) : false;
                return `
          <article class="event-card" data-tag-id="${t.id}">
            <div class="event-card__content">
              <p class="event-card__title">${this.#escape(t.name)}</p>
            </div>
            <div class="event-card__actions">
             <button type="button" class="btn btn--danger btn-delete" data-used="${used}">
                Löschen
              </button>
            </div>
          </article>
        `;
            })
            .join("");

        this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/main.css">

      <section class="panel panel--list">
        <header class="panel__header">
          <h2>Tags verwalten</h2>
        </header>

        <div class="form-group">
          <label for="new-tag-main">Neuen Tag erstellen</label>
          <div class="btn-row">
            <input id="new-tag-main" name="new-tag-main" type="text" placeholder="z. B. Outdoor" />
            <button type="button" class="btn btn--primary btn-save">Speichern</button>
          </div>
        </div>

        <div class="event-list" aria-label="Vorhandene Tags">
          <label for="new-tag-main">Vorhandene Tags</label>
          ${tagsHtml || `<p style="padding:12px; opacity:.7;">Keine Tags vorhanden.</p>`}
        </div>
      </section>
    `;

        // Tag erstellen
        this.shadowRoot.querySelector(".btn-save")?.addEventListener("click", () => {
            const input = this.shadowRoot.querySelector("#new-tag-main");
            const name = input?.value ?? "";

            // leere Eingabe verhindern
            if (!name.trim()) return;

            this.dispatchEvent(
                new CustomEvent("create-tag", {
                    detail: { name: name.trim() },
                    bubbles: true,
                    composed: true,
                })
            );

            input.value = "";
        });

        // Tag löschen
        this.shadowRoot.addEventListener("click", (ev) => {
            const btn = ev.target.closest(".btn-delete");
            if (!btn) return;

            const card = btn.closest("[data-tag-id]");
            const tagId = card?.dataset?.tagId;
            if (!tagId) return;

            this.dispatchEvent(new CustomEvent("delete-tag", {
                    detail: tagId,
                    bubbles: true,
                    composed: true,
                })
            );
        });
    }

    #escape(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}
customElements.define("tag-manager", TagManager);