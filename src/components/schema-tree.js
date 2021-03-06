import { LitElement, html } from 'lit-element'; 
import vars from '@/styles/vars';
import FontStyles from '@/styles/font-styles';
import marked from 'marked';
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';

export default class SchemaTree extends LitElement {
  render() {
    return html`
      ${FontStyles}
      <style>
        .tree{
          font-family: var(--font-mono);
          font-size:12px;
          display:inline-block;
          overflow:hidden;
          width:100%;
        }
        .item{
          white-space: nowrap;
          display: table;
        }
        .item-key{
          display:inline;
        }
        .item-value{
          display: table-cell;
          white-space: normal;
        }
        .item-type{
          display: table-cell;
        }
        .obj-descr{
          color:var(--light-fg);
          font-family:var(--font-regular);
          display:inline;
          white-space:normal;
        }
        .item-descr{
          color:var(--light-fg);
          display: table-cell;
          padding-left:12px;
          min-width: 125px;
          font-family:var(--font-regular);
        }
        .descr-expander{
          display: table-cell;
          cursor:pointer;
          color:orange;
        }
        .left-bracket{
          display:inline-block;
          padding: 0 20px 0 0;
          cursor:pointer;
          border: 1px solid transparent;
          border-radius:3px;
        }
        .left-bracket:hover{
          color:var(--primary-color);
          background-color:var(--hover-color);
          border: 1px solid var(--border-color);
        }
        .inside-bracket{
          padding-left:12px;
          border-left:1px dotted var(--border-color);
        }
        /*
        .m-markdown > p{
          margin-block-start:0;
          margin-block-end:5px;
        }
        */
        .stri, .string{color:#86b300;}
        .inte, .numb, .number{color:#47afe8;}
        .null {color:orangered;}
        .bool, .boolean{color:#b96ff1}
        .enum {color:orange}
        @media only screen and (min-width: 768px){
          .item-descr{
            padding-left:24px;
          }
        }



      </style>
      <div class="tree">
        ${this.generateTree(this.data)}
      </div>  
    `
  }

  static get properties() {
    return {
      data:{type: Object}
    };
  }

  generateTree(data){
    if (data===null){
      return html`<div class="null" style="display:inline;">null</div>`
    }
    if (typeof data === 'object'){
      let detailType = Array.isArray(data)?"array":"pure_object";
      if (Object.keys(data).length===0){
        return html`${ (Array.isArray(data)?'[ ]':'{ }') }`
      }
      if ((Object.keys(data).length===1) && Object.keys(data)[0]===':description' ){
        return html`{ } <span class='obj-descr'> ${data[':description']} </span>`
      }
      if (detailType==='array' && data[0]==='~|~' ){
        return html`[ ]`
      }
      return html`
      <div class="left-bracket expanded ${detailType==='array'?'array':'object'} " @click="${this.toggleExpand}" > ${detailType==='array'?`[`:'{'}</div>
        ${data[':description']?html`<span class='obj-descr obj-content-part'> ${data[':description']} </span>`:''}
        <div class="inside-bracket obj-content-part" >
        ${Object.keys(data).map(
          key => html`
            ${key!==':description'? html`<div class="item"> <span class="item-key"> 
              ${detailType==='pure_object'?html`${key}:`
              :``} 
            </span>${this.generateTree(data[key])}</div>`
            :''}`
        )}
        </div>
      <div class="right-bracket obj-content-part">${detailType==='array'?']':'}'}</div>
      `
    }
    else{
      return html`<span class="item-value">
        ${data ? html`
          ${data.split("~|~").map(
            (item,idx) => html`
              ${item? html`<div class='${idx==0?'item-type ' + item.substring(0,4):'m-markdown-small item-descr'}'>
                ${idx==0?html`${item}`:html`${unsafeHTML(marked(item))}`
                }</div>`
              :``}`
          )}`:''
        }
      </span>`


    }

  }

  toggleExpand(e){
    if (e.target.classList.contains("expanded")){
      e.target.classList.add("collapsed");
      e.target.classList.remove("expanded");
      e.target.innerHTML = e.target.classList.contains("array")? "[...]":"{...}";
      let els = e.target.parentNode.querySelectorAll(":scope > .obj-content-part")
      els.forEach( el => el.style.display='none');
    }
    else{
      e.target.classList.remove("collapsed");
      e.target.classList.add("expanded");
      e.target.innerHTML = e.target.classList.contains("array")? "[":"{";
      let els = e.target.parentNode.querySelectorAll(":scope > .obj-content-part");
      els.forEach( el =>  el.style.display=  el.classList.contains("obj-descr")?'inline':'block');
    }

    //console.log(e.target.parentElement.querySelectorAll(":scope > .inside-bracket"));
  }
  toggleDescr(){
    console.log("descr")
  }
}
// Register the element with the browser
customElements.define('schema-tree', SchemaTree);
