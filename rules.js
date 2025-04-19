class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        let initial = this.engine.storyData.InitialLocation;
        this.engine.gotoScene(this.engine.storyData.Locations[initial].Type, initial);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);
        
        if(locationData.Choices.length > 0) {
            let choice = locationData.Choices.find(this.findNorth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 1);
            }
            choice = locationData.Choices.find(this.findWest);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = locationData.Choices.find(this.findEast);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = locationData.Choices.find(this.findSouth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 3);
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            this.engine.gotoScene(this.engine.storyData.Locations[choice.Target].Type, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }

    findNorth(choice) {
        return choice.Text == "Go North";
    }
    findEast(choice) {
        return choice.Text == "Go East";
    }
    findSouth(choice) {
        return choice.Text == "Go South";
    }
    findWest(choice) {
        return choice.Text == "Go West";
    }
}

class Battle extends Scene {
    create(key) {
        this.locationData = this.engine.storyData.Locations[key];
        this.enemyData = this.engine.storyData.Enemies[this.locationData.Enemy];
        if (this.locationData.EnemyHP == "NULL") this.locationData.EnemyHP = this.enemyData.HP;

        if (this.locationData.Turn == "Player") {
            this.engine.show("Your turn!");
            for (let i = 0; i < this.engine.unlockedSkills.length; i++) {
                if (this.engine.unlockedSkills[i] == true) {
                    if (this.engine.hasAP[i] == true) {
                        this.engine.addChoice(this.locationData.Choices[i] + "(AP: " + this.locationData[this.locationData.Choices[i]].AP + ")", this.locationData.Choices[i]);
                    } else {
                        this.engine.addChoice(this.locationData.Choices[i], this.locationData.Choices[i]);
                    }
                }
            }
        } else {
            let enemy = this.engine.storyData.Enemies[this.locationData.Enemy];
            this.engine.show(this.locationData.Enemy + "'s turn!");
            let len = enemy.ATK.length;
            let weight_sum = 0;
            let dmg = 0;
            for (let weight of enemy.Weights) {
                weight_sum += weight;
            }
            let choice = Math.floor(Math.random() * weight_sum);
            for (let i = 0; i < len; i++) {
                if (choice <= enemy.Weights[i]) {
                    dmg = enemy.ATK[i];
                    break;
                }
                choice -= enemy.Weights[i];
            }

            this.engine.hp -= dmg;
            if (this.engine.hp > 0) {
                this.engine.show(dmg + " damage taken. You are now at " + this.engine.hp + " HP.");
                this.locationData.Turn = "Player";
                this.engine.gotoScene(Battle, "Battle");

            } else {
                this.engine.show("You died. Returning to last safe room.");
                this.resetBattle();
                this.engine.gotoScene(this.engine.storyData.Locations[this.engine.lastSaferoom].Type, this.engine.lastSaferoom);
            }
        }
    }

    handleChoice(choice) {
        this.switchTurn = true;
        this.exitScene = false;
        switch(choice) {
            case "Attack":
                this.dealDamage(this.engine.atk);
                break;

            case "Heal":
                if (this.locationData.Heal.AP > 0) {
                    this.engine.hp += 40;
                    this.locationData.AP -= 1;
                    if (this.engine.hp > this.engine.maxhp) this.engine.hp = this.engine.maxhp;
                    this.engine.show("Healed 40 HP. You are now at " + this.engine.hp + " HP.");
                } else {
                    this.engine.show("Out of AP.");
                    this.switchTurn = false;
                }
                break;

            case "Defend":
                if (this.locationData.Defend.AP > 0) {
                    this.locationData.Defend.Status = "True";
                    this.locationData.Defend.TurnsLeft = 3;
                    this.locationData.Defend.AP -= 1;
                    this.engine.show("Damage halved for 3 turns!");
                } else {
                    this.engine.show("Out of AP.");
                    this.switchTurn = false;
                }
                break;

            case "Stun":
                if (this.locationData.Stun.AP > 0) {
                    this.locationData.Stun.Status = "True";
                    this.locationData.Stun.TurnsLeft = 2;
                    this.locationData.Stun.AP -= 1;
                    this.engine.show("Enemy stunned!");
                } else {
                    this.engine.show("Out of AP.");
                    this.switchTurn = false;
                }
                break;

            case "Strengthen":
                if (this.locationData.Strengthen.AP > 0) {
                    this.locationData.Strengthen.Status = "True";
                    this.locationData.Strengthen.TurnsLeft = 1;
                    this.locationData.Strengthen.AP -= 1;
                    this.engine.show("Damage tripled for one turn! Bring on the damage!");
                } else {
                    this.engine.show("Out of AP.");
                    this.switchTurn = false;
                }
                break;

            case "Gigaflare":
                if (this.locationData.Gigaflare.AP > 0) {
                    this.locationData.Gigaflare.AP -= 1;
                    this.dealDamage(20)
                } else {
                    this.engine.show("Out of AP.");
                    this.switchTurn = false;
                }
                break;

            case "Run":
                let rand = Math.floor(Math.random() * 2);
                if (rand == 0) {
                    this.switchTurn = false;
                    this.engine.show("Returning to last saferoom.")
                    this.resetBattle();
                    this.exitScene = true;
                    this.engine.gotoScene(this.engine.storyData.Locations[this.engine.lastSaferoom].Type, this.engine.lastSaferoom);
                } else {
                    this.engine.show("Escape failed.");
                }
                break;
        }
        if (this.switchTurn == true) {
            this.locationData.Turn = "Enemy";
        }
        if (this.exitScene == false) this.engine.gotoScene(Battle, "Battle");
    }

    dealDamage(dmg) {
        if (this.locationData.Strengthen.Status == "False") {
            this.locationData.EnemyHP -= dmg;
            this.engine.show(dmg + " damage dealt!");
        }
        else {
            this.locationData.EnemyHP -= dmg * 3;
            this.engine.show((dmg * 3) + " damage dealt!");
            this.locationData.Strengthen.TurnsLeft -= 1;
            if (this.locationData.Strengthen.TurnsLeft <= 0) {
                this.locationData.Strengthen.Status = "False";
            }
        }

        if (this.locationData.EnemyHP <= 0) {
            this.engine.show("You defeated the " + this.locationData.Enemy + "!");
            if (this.engine.storyData.Locations[this.locationData.ReturnTarget].Type == "Special") {
                let skill = this.engine.storyData.Locations[this.locationData.ReturnTarget].Skill;
                let skillIndex = this.engine.skillsList.indexOf(skill);
                this.engine.unlockedSkills[skillIndex] = true;
                this.engine.show("You unlocked the " + skill + " Spell!");
            }

            this.resetBattle()
            this.engine.storyData.Locations[this.locationData.ReturnTarget].Defeated = "True";
            this.switchTurn = false;
            this.exitScene = true;
            this.engine.gotoScene(this.engine.storyData.Locations[this.locationData.ReturnTarget].Type, this.locationData.ReturnTarget);
        } else {
            this.engine.show("The " + this.locationData.Enemy + " is at " + this.locationData.EnemyHP + " HP.")
        }
    }

    resetBattle() {
        this.locationData.Enemy = "NULL";
        this.locationData.EnemyHP  = "NULL";
        this.locationData.Heal.AP = 3;
        this.locationData.Defend.Status = "False";
        this.locationData.Defend.AP = 5;
        this.locationData.Defend.Stun = "False";
        this.locationData.Stun.AP = 2;
        this.locationData.Strengthen.Status = "False";
        this.locationData.Strengthen.AP = 3;
        this.locationData.Gigaflare.AP = 3;
        this.locationData.Turn = "Player";
        this.engine.hp = this.engine.maxhp;
    }
}

class Enemy extends Scene {
    create(key) {
        this.locationData = this.engine.storyData.Locations[key];
        if (this.locationData.Defeated == "False") {
            this.engine.show("You encountered a " + this.locationData.Enemy + "!");
            let battle = this.engine.storyData.Locations.Battle;
            battle.ReturnTarget = key;
            battle.Enemy = this.locationData.Enemy;
            this.engine.gotoScene(Battle, "Battle");

        } else {
            this.engine.show(this.locationData.Body);
            let choice = this.locationData.Choices.find(this.findNorth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 1);
            }
            choice = this.locationData.Choices.find(this.findWest);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = this.locationData.Choices.find(this.findEast);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = this.locationData.Choices.find(this.findSouth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 3);
            }
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            this.engine.gotoScene(this.engine.storyData.Locations[choice.Target].Type, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }

    findNorth(choice) {
        return choice.Text == "Go North";
    }
    findEast(choice) {
        return choice.Text == "Go East";
    }
    findSouth(choice) {
        return choice.Text == "Go South";
    }
    findWest(choice) {
        return choice.Text == "Go West";
    }
}

class Goal extends Enemy {
    create(key) {
        this.locationData = this.engine.storyData.Locations[key];
        if (this.locationData.Defeated == "False") {
            this.engine.show("You encountered a " + this.locationData.Enemy + "!");
            let battle = this.engine.storyData.Locations.Battle;
            battle.ReturnTarget = key;
            battle.Enemy = this.locationData.Enemy;
            this.engine.gotoScene(Battle, "Battle");

        } else {
            this.engine.show("You beat the Final Boss! You Win!");
            this.engine.gotoScene(End, End);
        }
    }
}

class Heal extends Scene {
    create(key) {
        this.engine.lastSaferoom = key;
        this.locationData = this.engine.storyData.Locations[key];
        if (this.locationData.Available == "True" && this.locationData.ShowInitial == "True") {
            this.engine.show(this.locationData.Body1);
            for(let choice of this.locationData.Choices) {
                if (choice.Initial == "True") {
                    this.engine.addChoice(choice.Text, choice);
                }
            }

        } else {
            this.engine.show(this.locationData.Body2);
            let choice = this.locationData.Choices.find(this.findNorth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 1);
            }
            choice = this.locationData.Choices.find(this.findWest);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = this.locationData.Choices.find(this.findEast);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = this.locationData.Choices.find(this.findSouth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 3);
            }
        }
    }

    handleChoice(choice) {
        if (choice) {
            this.engine.show("&gt; "+choice.Text);
            if (choice.Text == "Yes") {
                this.engine.hp = this.engine.maxhp;
                this.engine.show("Health fully restored.");
                this.locationData.Available = "False";
                this.locationData.ShowInitial = "False";
                this.engine.gotoScene(Heal, choice.Target);

            } else if (choice.Text == "No") {
                this.locationData.ShowInitial = "False";
                this.engine.gotoScene(Heal, choice.Target);

            } else {
                if (this.locationData.Available == "True") {
                    this.locationData.ShowInitial = "True";
                }
                this.engine.gotoScene(this.engine.storyData.Locations[choice.Target].Type, choice.Target);
            }
        }
    }

    findNorth(choice) {
        return choice.Text == "Go North";
    }
    findEast(choice) {
        return choice.Text == "Go East";
    }
    findSouth(choice) {
        return choice.Text == "Go South";
    }
    findWest(choice) {
        return choice.Text == "Go West";
    }
}

class Lock extends Location {
    create(key) {
        this.locationData = this.engine.storyData.Locations[key];
        if (this.locationData.Locked == "True") {
            this.engine.show(this.locationData.Body1);
            if (this.engine.key == true) {
                this.engine.addChoice2("Unlock door", "Unlock", 1);
            }

        } else {
            this.engine.show(this.locationData.Body2);
        }

        let choice = this.locationData.Choices.find(this.findNorth);
        if (choice != undefined && (choice.Locked == "False" || (choice.Locked == "True" && this.locationData.Locked == "False"))) {
            this.engine.addChoice2(choice.Text, choice, 1);
        }
        choice = this.locationData.Choices.find(this.findWest);
        if (choice != undefined && (choice.Locked == "False" || (choice.Locked == "True" && this.locationData.Locked == "False"))) {
            this.engine.addChoice2(choice.Text, choice, 2);
        }
        choice = this.locationData.Choices.find(this.findEast);
        if (choice != undefined && (choice.Locked == "False" || (choice.Locked == "True" && this.locationData.Locked == "False"))) {
            this.engine.addChoice2(choice.Text, choice, 2);
        }
        choice = this.locationData.Choices.find(this.findSouth);
        if (choice != undefined && (choice.Locked == "False" || (choice.Locked == "True" && this.locationData.Locked == "False"))) {
            this.engine.addChoice2(choice.Text, choice, 3);
        }
    }

    handleChoice(choice) {
        if(choice) {
            if (choice == "Unlock") {
                this.locationData.Locked = "False";
                this.engine.gotoScene(Lock, "I17");
            } else {
                this.engine.show("&gt; "+choice.Text);
                this.engine.gotoScene(this.engine.storyData.Locations[choice.Target].Type, choice.Target);
            }
        }
    }
}

class Key extends Location {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);
        this.engine.key = true;
        
        if(locationData.Choices.length > 0) {
            let choice = locationData.Choices.find(this.findNorth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 1);
            }
            choice = locationData.Choices.find(this.findWest);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = locationData.Choices.find(this.findEast);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 2);
            }
            choice = locationData.Choices.find(this.findSouth);
            if (choice != undefined) {
                this.engine.addChoice2(choice.Text, choice, 3);
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }
}

class End extends Scene {
    create(key) {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');