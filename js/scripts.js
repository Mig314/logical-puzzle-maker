//word[属性][人数(+α)]には、各属性の単語と属性によって変わる表現が登録されています。
let word=[];
word[0]=["アキラ", "カオル", "サツキ", "タクミ","ナギサ","ハルカ","マコト","","","","","",""];
word[1]=["カレー", "ラーメン", "パスタ", "ピザ","寿司","ハンバーグ","オムライス","","","","料理","食べ","を食べた人"];
word[2]=["お茶", "ジュース", "コーヒー","ビール","ワイン","水","牛乳","","","","飲み物","飲み","を飲んだ人"];
word[3]=["ケーキ","プリン","ゼリー","パフェ","ワッフル","アイスクリーム","あんみつ","","","","デザート","食べ","を食べた人"];
word[4]=["500円", "600円", "700円","800円","900円","1000円","2000円","","","","代金","支払い","を支払った人"];
//num_peopleは登場人物の数，num_varietyは属性の数，num_matrixは表の数，stateは状態(初期は0，問題生成で1，解答生成で2)を表します。
//messageは表示する文章，answer[表][人数][人数]はパズルの解(〇は1，×は-1)を表します。
let num_people=3;
let num_variety=2;
let num_matrix=num_variety*(num_variety-1)/2;
let state=0;
let message="";
let button_message="（所要時間：なし）";
let answer=[];

//make_puzzle()は問題を生成する関数です。
function make_puzzle(){
    if(state===0){
    let start=performance.now();
    num_people=Number(document.querySelector(`form`).radio_people.value);
    num_variety=Number(document.querySelector(`form`).radio_variety.value);
    num_matrix=num_variety*(num_variety-1)/2;
    //hint[表][人数][人数]はパズルのヒント(〇は1，×は-1)を表します。
    //assump[表][人数][人数]は解を数えるときに仮定する解(〇は1，×は-1)を表します。
    //flag[表][人数][人数]はhintを削るときそのhintを調べたかどうかのフラグ(未は0，済は1)を表します。
    let hint=[];
    let assump=[];
    let flag=[];
    for(let i=0;i<num_matrix;i+=1){
        answer[i]=[];
        hint[i]=[];
        assump[i]=[];
        flag[i]=[];
        for(let j=0;j<num_people;j+=1){
            answer[i][j]=[];
            hint[i][j]=[];
            assump[i][j]=[];
            flag[i][j]=[];
            for(let k=0;k<num_people;k+=1){
                answer[i][j][k]=0;
                flag[i][j][k]=0;
            }
        }
    }
    //登場人物を行に持つ表で〇にする部分をランダムで決めて、そのanswerを1にします。
    let num=[];
    for(let j=0;j<num_people;j+=1){
        num[j]=j;
    }
    for(let i=0;i<num_variety-1;i+=1){
        let list=permutation(num,num_people)[Math.floor(Math.random()*permutation(num,num_people).length)];
        for(let j=0;j<num_people;j+=1){
            answer[i][j][list[j]]=1;
        }
    }
    //残りの表で〇になる部分のanswerに1を格納します。
    //登場人物を行に持つi1番目とi1+i2番目の表は、登場人物を行や列に持たない(2*num_variety-i1-2)*(i1+1)/2+i2-1番の表の〇を定めます。
    for(let i1=0;i1<num_variety-2;i1+=1){
        for(let i2=1;i2<num_variety-i1-1;i2+=1){
            for(let j=0;j<num_people;j+=1){
                for(let k=0;k<num_people;k+=1){
                    for(let l=0;l<num_people;l+=1){
                        answer[(2*num_variety-i1-2)*(i1+1)/2+i2-1][j][k]+=answer[i1][l][j]*answer[i1+i2][l][k];
                    }
                }
            }
        }
    }
    //表の〇でない部分のanswerを-1にして、hintにanswerを写します。
    for(let i=0;i<num_matrix;i+=1){
        for(let j=0;j<num_people;j+=1){
            for(let k=0;k<num_people;k+=1){
                answer[i][j][k]=2*answer[i][j][k]-1;
                hint[i][j][k]=answer[i][j][k];
            }
        }
    }
    //ランダムなhintを1つ(hint[t1][t2][t3])ずつを削ろうと試み、どのhintも削れなくなるまでループします。
    //すべてのassumpをanswerのように用意して、hintと矛盾しないassumpが複数になる場合は削りません。
    //cnt_flagは1であるflagの数，cnt_answerは現在のhintでの解の数，memoはhint[t1][t2][t3]が削れない場合に戻すための記録を表します。
    //高速化のために、はじめに確実に削ることができるhintを削ります。
    for(let i=0;i<num_matrix;i+=1){
        let t2=Math.floor(Math.random()*num_people);
        for(let j=0;j<num_people;j+=1){
            let list=permutation(num,2)[Math.floor(Math.random()*permutation(num,2).length)];
            hint[i][j][list[0]]=0;
            flag[i][j][list[0]]=1;
            if(j===t2){
                hint[i][j][list[1]]=0;
                flag[i][j][list[1]]=1;
            }
        }
    }
    let cnt_flag=num_matrix*(num_people+1);
    let perm_num=power(permutation(num,num_people),num_variety-1);
    while(cnt_flag<num_matrix*num_people**2){
        let t1=Math.floor(Math.random()*num_matrix);
        let t2=Math.floor(Math.random()*num_people);
        let t3=Math.floor(Math.random()*num_people);
        if(flag[t1][t2][t3]===0){
            let cnt_answer=0;
            let memo=hint[t1][t2][t3];
            hint[t1][t2][t3]=0;
            flag[t1][t2][t3]=1;
            cnt_flag+=1;
            for(let list of perm_num){
                for(let i=0;i<num_matrix;i+=1){
                    for(let j=0;j<num_people;j+=1){
                        for(let k=0;k<num_people;k+=1){
                            assump[i][j][k]=0;
                        }
                    }
                }
                for(let i=0;i<num_variety-1;i+=1){
                    for(let j=0;j<num_people;j+=1){
                        assump[i][j][list[i][j]]=1;
                    }
                }
                for(let i1=0;i1<num_variety-2;i1+=1){
                    for(let i2=1;i2<num_variety-i1-1;i2+=1){
                        for(let j=0;j<num_people;j+=1){
                            for(let k=0;k<num_people;k+=1){
                                for(let l=0;l<num_people;l+=1){
                                    assump[(2*num_variety-i1-2)*(i1+1)/2+i2-1][j][k]+=assump[i1][l][j]*assump[i1+i2][l][k];
                                }
                            }
                        }
                    }
                }
                //fはフラグ(hintとassumpが矛盾しなければ0，矛盾すれば1)を表します。
                let f=0;
                for(let i=0;i<num_matrix;i+=1){
                    for(let j=0;j<num_people;j+=1){
                        for(let k=0;k<num_people;k+=1){
                            assump[i][j][k]=2*assump[i][j][k]-1;
                            if(hint[i][j][k]*assump[i][j][k]<0){
                                f=1;
                            }
                        }
                    }
                }
                if(f===0){
                    cnt_answer+=1;
                }
            }
            if(cnt_answer>1){
                hint[t1][t2][t3]=memo;
            }
            console.log(`${cnt_flag}/${num_matrix*num_people**2}完了　ここまで${(performance.now()-start)/1000}秒`);
        }
    }
    //問題文の最初に設定の文章を作ります。
    message="《問題》\n";
    for(let i=0;i<num_people-1;i+=1){
        message+=`${word[0][i]}，`;
    }
    message+=`${word[0][num_people-1]}の${num_people}人は、`;
    for(let i=1;i<num_variety;i+=1){
        for(let j=0;j<num_people-1;j+=1){
            message+=`${word[i][j]}，`;
        }
        message+=`${word[i][num_people-1]}のうち異なる${word[i][10]}を${word[i][11]}`;
        if(i<num_variety-1){
            message+="、";
        }else{
            message+="ました。\n\n";
        }
    }
    //削らず残ったhintをwordを使った文章に翻訳して問題文に加えます。
    //i1番目の属性を行に持ちi1+i2番目の属性を列に持つ表は(2*num_variety-i1-1)*i1/2+i2-1番目の表です。
    //×のヒントは行でまとめて文章を作り、〇のヒントに置き換えできる場合は置き換えます。
    for(let i1=0;i1<num_variety-1;i1+=1){
        for(let i2=1;i2<num_variety-i1;i2+=1){
            for(let j=0;j<num_people;j+=1){
                //cntは行に残っていてまだ文章に反映していない×のヒントの数を表します。
                let cnt=0;
                for(let k=0;k<num_people;k+=1){
                    if(hint[(2*num_variety-i1-1)*i1/2+i2-1][j][k]<0){
                        cnt+=1;
                    }
                }
                if(cnt===num_people-1){
                    for(let k=0;k<num_people;k+=1){
                        hint[(2*num_variety-i1-1)*i1/2+i2-1][j][k]+=1;
                    }
                }else if(cnt>0){
                    message+=`${word[i1][j]}${word[i1][12]}は`;
                    for(let k=0;k<num_people;k+=1){
                        if(hint[(2*num_variety-i1-1)*i1/2+i2-1][j][k]<0){
                            message+=`${word[i1+i2][k]}`;
                            cnt+=-1;
                            if(cnt>0){
                                message+="や";
                            }
                        }
                    }
                    message+=`を${word[i1+i2][11]}ませんでした。\n`;
                }
                for(let k=0;k<num_people;k+=1){
                    if(hint[(2*num_variety-i1-1)*i1/2+i2-1][j][k]>0){
                        message+=`${word[i1][j]}${word[i1][12]}は${word[i1+i2][k]}を${word[i1+i2][11]}ました。\n`;
                    }
                }
            }
        }
    }
    //問題文の最後の文章を加えて、表示します。
    if(num_variety<3){
        message+=`\n${num_people}人は何を食べたでしょうか？`;
    }else if(num_variety<5){
        message+=`\n${num_people}人は何を食べて何を飲んだでしょうか？`;
    }else{
        message+=`\n${num_people}人は何を食べて何を飲んで何円支払ったでしょうか？`;
    }
    document.form.text.value=message;
    document.getElementById('button_puzzle').innerText="生成完了";
    state=1;
    }
}

//make_answer()は解答を生成やリセットする関数です。
function make_answer(){
    if(state===1){
        message+="\n\n《解答》\n";
        for(let j=0;j<num_people;j+=1){
            message+=`${word[0][j]}…`;
            for(let i=1;i<num_variety-1;i+=1){
                for(let k=0;k<num_people;k+=1){
                    if(answer[i-1][j][k]===1){
                        message+=`${word[i][k]}，`;
                    }
                }
            }
            for(let k=0;k<num_people;k+=1){
                if(answer[num_variety-2][j][k]===1){
                    message+=`${word[num_variety-1][k]}\n`;
                }
            }
        }
        document.form.text.value=message;
        document.getElementById('button_answer').innerText="リセット";
        state=2;
    }else if(state===2){
        window.location.reload();
    }
}

//change_button()は問題ボタンの表示を変える関数です。
function change_button(){
    if(state===0||state===3){
        state=0;
        num_people=Number(document.querySelector(`form`).radio_people.value);
        num_variety=Number(document.querySelector(`form`).radio_variety.value);
        button_message="（所要時間：なし）";
        if(num_people===4){
            if(num_variety===4){
                button_message="（所要時間：数秒）";
            }else if(num_variety===5){
                button_message="（所要時間：数分）";
            }
        }else if(num_people===5){
            if(num_variety===3){
                button_message="（所要時間：数秒）";
            }else if(num_variety===4){
                button_message="（所要時間：数分）";
            }else if(num_variety>4){
                button_message="（メモリー不足のため生成できません）";
                state=3;
            }
        }else if(num_people===6){
            if(num_variety===3){
                button_message="（所要時間：数分）";
            }else if(num_variety>3){
                button_message="（メモリー不足のため生成できません）";
                state=3;
            }
        }else if(num_people===7){
            if(num_variety===3){
                button_message="（所要時間：数時間）";
            }else if(num_variety>3){
                button_message="（メモリー不足のため生成できません）";
                state=3;
            }
        }
        document.getElementById('button_puzzle').innerText="問題"+button_message;
    }
}

//permutation(list,n)は、listの要素をn個並べた順列全体を返す関数です。
function permutation(list,n){
    let perm=[];
    if(n===1){
        for(let i=0;i<list.length;i+=1){
            perm[i]=[list[i]];
        }
    }else{
        for(let i=0;i<list.length;i+=1){
            let part=list.slice(0);
            part.splice(i,1);
            let part_permu=permutation(part,n-1);
            for(let j=0;j<part_permu.length;j+=1){
                perm.push([list[i]].concat(part_permu[j]));
            }
        }
    }
    return perm;
}

//power(list,n)は、listを集合とみてn乗した集合を返す関数です。
function power(list,n){
    let pow=[];
    if(n===1){
        for(let i=0;i<list.length;i+=1){
            pow[i]=[list[i]];
        }
    }else{
        let part_pow=power(list,n-1);
        for(let i=0;i<part_pow.length;i+=1){
            for(let j=0;j<list.length;j+=1){
                pow.push(part_pow[i].concat([list[j]]));
            }
        }
    }
    return pow;
}