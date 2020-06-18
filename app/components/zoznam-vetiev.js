import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ZoznamVetievComponent extends Component {
    @service store;
    @service messages;

    get lines(){
        return this.store.peekAll('vetva');
    }

    get sortedLines(){
        return this.lines.sortBy('id');
    }

    @action onChange(line, isOn){
        this.messages.saveVetva(line, isOn);
    }

    @action automatChanged(line, isAutomat){
        this.messages.saveAutomat(line, isAutomat);
    }

    @action changeOpenTime(line, evt){
        let time = parseInt(evt.currentTarget.value);
        line.openTime = time; 
    }

    @action changePlan(line, plan){
        line.plan = plan; 
    }
}
