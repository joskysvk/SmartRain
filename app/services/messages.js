import Service, { inject as service } from '@ember/service';
import ENV from 'zavlaha/config/environment';
import { tracked } from '@glimmer/tracking';

export default class MessagesService extends Service {
    socket = null;
    @service store;
    @tracked connected = false;

    saveVetva(vetva, isOn){
        vetva.saving = true;
        this.socket.emit('vetvaStav', {
            name: vetva.id,
            state: isOn
        });
    }

    saveAutomat(vetva, isAutomat, plan, openTime){
        if(isAutomat === undefined || isAutomat === null){
            isAutomat = vetva.isAutomat;
        }
        if(plan === undefined || plan === null){
            plan = vetva.plan;
        }
        if(openTime === undefined || openTime === null){
            openTime = vetva.openTime;
        }

        vetva.automatSaving = true;
        this.socket.emit('automatStav', {
            name: vetva.id,
            state: isAutomat,
            plan: plan,
            openTime: openTime
        });
    }

    logout(){
        window.sessionStorage.removeItem('pwd');
        window.sessionStorage.removeItem('usr');
        window.location.reload();
    }

    tryReconnect(){
        return new Promise((resolve, reject)=>{
            let pwd = window.sessionStorage.getItem('pwd');
            let usr = window.sessionStorage.getItem('usr');
            if(pwd){
                this.connect(usr,pwd).then(()=>{
                    resolve();
                }).catch(err=>{
                    window.sessionStorage.removeItem('pwd');
                    window.sessionStorage.removeItem('usr');
                    reject(err);
                });
            }else{
                reject('Not logged in');
            }
        })
    }

    connect(name, password){
        this.password = password;
        return new Promise((resolve, reject)=>{
            this.socket = io(ENV.apiUrl, {
                query:`pwd=${encodeURIComponent(password)}&usr=${encodeURIComponent(name)}`
            });

            this.socket.on('vetvaStav', data=>{
                console.log(data);
                this.onVetva(data);
            });

            this.socket.on('automatStav', data=>{
                console.log(data);
                this.onAutomat(data);
            });

            this.socket.on('disconnect', (err)=>{
                this.connected = false;
            });

            this.socket.on('reconnect', (err)=>{
                this.connected = true;
            });

            this.socket.on('connect', ()=>{
                this.connected = true;
                window.sessionStorage.setItem('usr', name);
                window.sessionStorage.setItem('pwd', password);
                resolve();
            });

            this.socket.on('error', (err)=>{
                this.connected = false;
                reject(err);
            });
            this.socket.on('connect_error', (err)=>{
                this.connected = false;
                reject(err);
            });

        });
    }

    onVetva(data){
        let vetva = this.store.peekRecord('vetva', data.name);

        if(vetva){
            vetva.isOn = !!data.state;
            vetva.saving = false;
        }else{
            this.store.push({
                data:{
                    id: data.name,
                    type: 'vetva',
                    attributes: {
                        isOn: !!data.state,
                    }
                }
            });
        }
    }

    onAutomat(data){
        let vetva = this.store.peekRecord('vetva', data.name);

        if(vetva){
            vetva.isAutomat = !!data.state;
            vetva.plan = data.plan;
            vetva.openTime = data.openTime;
            vetva.automatSaving = false;
        }else{
            this.store.push({
                data:{
                    id: data.name,
                    type: 'vetva',
                    attributes: {
                        isAutomat: !!data.state,
                        plan: data.plan,
                        openTime: data.openTime
                    }
                }
            });
        }
    }
}
