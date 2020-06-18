import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class VetvaDetailComponent extends Component {
    @service messages;
    minutes = [];

    constructor(){
        super(...arguments);

        for(let i=1;i<60;i++){
            this.minutes.push(i);
        }
    }
}
