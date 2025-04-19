class Engine {

    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {
        window.engine = this;
        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        this.classes = {
            Heal: Heal,
            Location: Location,
            Enemy: Enemy,
            Goal: Goal,
            Special: Enemy,
            Key: Key,
            Lock: Lock
        };

        this.skillsList = ["Attack", "Heal", "Defend", "Stun", "Strengthen", "Gigaflare", "Run"];
        this.unlockedSkills = [true, false, false, false, false, false, true];
        this.hasAP = [false, true, true, true, true, true, false]
        this.maxhp = 50;
        this.hp = this.maxhp;
        this.lastSaferoom = "I4";
        this.key = false;
        this.atk = 5;

        this.header = document.body.appendChild(document.createElement("h1"));
        this.output = document.body.appendChild(document.createElement("div"));
        this.actions = document.body.appendChild(document.createElement("div"));
        this.actionsContainer = this.actions.appendChild(document.createElement("div"));
        this.actionsContainer2 = this.actions.appendChild(document.createElement("div"));
        this.actionsContainer3 = this.actions.appendChild(document.createElement("div"));

        fetch(storyDataUrl).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass)
            }
        );
    }

    gotoScene(sceneClass, data) {
        console.log("Switching to scene:", sceneClass, "with data:", data);
        if (typeof sceneClass != "string") {
            this.scene = new sceneClass(this);
        } else {
            this.scene = new this.classes[sceneClass](this);
        }
        this.scene.create(data);
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            while(this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild)
            }
            this.scene.handleChoice(data);
        }
    }

    addChoice2(action, data, num) {
        let button
        let con
        let containers = [this.actionsContainer, this.actionsContainer2, this.actionsContainer3];
        con = containers[num - 1];

        button = con.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            for (let container of containers) {
                while(container.firstChild) {
                    container.removeChild(container.firstChild)
                }
            }
            this.scene.handleChoice(data);
        }
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg;
        this.output.appendChild(div);
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    create() { }

    update() { }

    handleChoice(action) {
        console.warn('no choice handler on scene ', this);
    }
}