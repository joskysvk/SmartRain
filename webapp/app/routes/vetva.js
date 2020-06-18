import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class VetvaRoute extends Route {
    @service store;
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

    model(params){
        let vetva = this.store.peekRecord('vetva', params.vetva_id);
        if(!vetva){
            vetva = this.store.push({
                data: {
                    id: params.vetva_id,
                    type: 'vetva',
                    saving: true,
                    automatSaving: true
                }
            });
        }

        return vetva;
    }
}
