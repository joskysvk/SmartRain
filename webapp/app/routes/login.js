import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginRoute extends Route {
    @service messages;

    beforeModel(transition){
        if(this.messages.connected){
            this.transitionTo('zoznam');
        }else{
            return this.messages.tryReconnect().then(()=>{
                this.transitionTo('zoznam');
            }).catch(err=>{
                //
            });
        }
    }
}
