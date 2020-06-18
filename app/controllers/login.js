import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginController extends Controller {
    @tracked password = null;
    @tracked name = null;
    @service messages;
    @tracked errorMessage;
    @tracked loginIsRunning;

    constructor(){
        super(...arguments);

    }

    @action login(e){
        e.preventDefault();
        this.loginIsRunning = true;
        this.messages.connect(this.name, this.password).then(()=>{
            this.password = null;
            let previousTransition = this.previousTransition;
            if (previousTransition) {
                this.previousTransition = null;
                previousTransition.retry();
            } else {
                this.transitionToRoute('zoznam');
            }
        }).catch(err=>{
            this.errorMessage = 'Password is not correct';
        }).finally(()=>{
            this.loginIsRunning = false;
        });
    }

    @action changePassword(evt){
        this.password = evt.currentTarget.value;
    }

    @action changeName(evt){
        this.name = evt.currentTarget.value;
    }
}
