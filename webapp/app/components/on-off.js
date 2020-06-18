import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OnOffComponent extends Component {
    //loading checked disabled

    @action onClick(){
        if(this.args.onChange && !this.args.disabled){
            this.args.onChange(!this.args.checked);
        }
    }
}
