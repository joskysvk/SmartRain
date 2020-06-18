import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ZoznamRoute extends Route {
    @service messages;

    beforeModel(transition){
        return new Promise((resolve, reject)=>{
            if(!this.messages.connected){
                this.messages.tryReconnect().catch(err=>{
                    let loginController = this.controllerFor('login');
                    loginController.set('previousTransition', transition);
                    this.transitionTo('login');
                    resolve();
                });
            }
            resolve();
        });
    }
}
