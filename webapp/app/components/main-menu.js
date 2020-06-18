import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class MainMenuComponent extends Component {
    @service messages;

    @action logout(){
        this.messages.logout();
    }
}
