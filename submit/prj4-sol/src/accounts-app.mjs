import {
  HTML, //static HTML for overall app

  //functions which help build dynamic HTML
  makeSearchResult, makeAccountDetail, makeScrollElement, makeElement,
  
  IDS, //mapping from application state to HTML section id's.
} from './html-content.mjs';

/** Calling this function creates a custom <accounts-app> web
 *  component based an account-services services, web services
 *  ws and function extendFn.  The last argument is used to
 *  extend this solution for Project 5.  The function should
 *  be set up as the click handler for a extendFn element in
 *  the account-details and should be called with 2 arguments:
 *  the account-id and the HTML id of the extendFn element.    
 */
export default function makeAccountsAppElement(services, ws, extendFn) {

  customElements.define('accounts-app',
			makeAccountsClass(services, ws, extendFn));
  
  
}

/** By defining the component class within a closure we can allow
 *  the code in the class to access the parameters of this function.
 */
function makeAccountsClass(services, ws, extendFn) {

  return class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      //must always use this.shadowRoot to add to component
      this.shadowRoot.innerHTML = HTML;
      this.select('search');
      this.setNavHandlers();
      this.setCreateHandler();
      this.setSearchHandler();
    }

    /** Set state of app, where state is one of 'search', 'create' or
     *  'detail'.  Ensure that only the section corresponding to the
     *  selected state is visible by adding the 'invisible' class to
     *  other sections and ensuring that the 'invisible' class is not
     *  present on the selected section.
     */
    select(state) {
      for (const [s, sectionId] of Object.entries(IDS)) {
	const sectionElement = this.shadowRoot.querySelector(`#${sectionId}`);
	if (s === state) {
	  sectionElement.classList.remove('invisible');
	  this.sectionElement = sectionElement;
	}
	else {
	  sectionElement.classList.add('invisible');
	}
      }
    }


    /** Set up click handlers for the create and search navigation links
     *  at the start of each app section which select()'s the clicked
     *  on section.
     */
    setNavHandlers() {
    	  this.shadowRoot.querySelector(".nav-create")
          .addEventListener('click',() => this.select('create'))
		  console.log( this.shadowRoot.querySelector(".nav-create"));
		    console.log( this.shadowRoot.querySelector(".nav-"));
      this.shadowRoot.querySelector(".nav-search")
          .addEventListener('click',() => this.select('search'))
      //TODO
    }

    /** Set up a handler for submission of the create-form.  Ensure
     *  that the form is not submitted to the server the form-data is
     *  submitted via the newAccount() web services.  If there are no
     *  errors, the detail section is selected with the details of the
     *  newly created account.
     */
    setCreateHandler() {
      //TODO
      const f = this.shadowRoot.querySelector("#create-form")
     // console.log(f)
     //const u = 'https://zdu.binghamton.edu:2345/accounts/1671_30';
     //const r =  this.gethttp(u);
     //console.log(r);

      f.addEventListener("click", function(event){
            event.preventDefault()
          });
          
      this.shadowRoot.querySelector("#create-form button[type='submit']").
      addEventListener("click",async () => {
          const d = new FormData(f)
        console.log(d)
        const formData = Object.fromEntries(d)
        console.log(formData)

         const res = await services.newAccount(formData)
			if(!reportErrors(res,this.shadowRoot.querySelector('#create-section'))){
				  console.log(res)
				
				const acc = await this.gethttp(res);
				console.log('acc',acc);
				const elem = makeAccountDetail(acc.result.id,acc.result.holderId,acc.result.balance)
				console.log('elem',elem);
				this.shadowRoot.querySelector('#detail-section').append(elem);
				this.select('detail')
					  this.shadowRoot.querySelector(".nav-create")
          .addEventListener('click',() => this.select('create'))
		  console.log( this.shadowRoot.querySelector(".nav-create"));
		    console.log( this.shadowRoot.querySelector(".nav-"));
      this.shadowRoot.querySelector(".nav-search")
          .addEventListener('click',() => this.select('search'))
				 const ex = this.shadowRoot.querySelector(".extendFn")
				 ex.addEventListener("click",() => extendFn(ex.getAttribute('data-id'),ex.getAttribute('id')));
     		 
     	 }

    });
 }
 
 	async setDetails(selfurl){
 			const acc = await this.gethttp(selfurl);
				console.log('acc',acc);
				const elem = makeAccountDetail(acc.result.id,acc.result.holderId,acc.result.balance)
				console.log('elem',elem);
				this.shadowRoot.querySelector('#detail-section').append(elem);
				this.select('detail')
		//		this.setNavHandlers();
				this.shadowRoot.querySelector(".nav-create")
          .addEventListener('click',() => this.select('create'))
		  console.log( this.shadowRoot.querySelector(".nav-create"));
		    console.log( this.shadowRoot.querySelector(".nav-"));
      this.shadowRoot.querySelector(".nav-search")
          .addEventListener('click',() => this.select('search'))
				 const ex = this.shadowRoot.querySelector(".extendFn")
				 ex.addEventListener("click",() => extendFn(ex.getAttribute('data-id'),ex.getAttribute('id')));
     		 
 	}
 	
 	
     async gethttp(path,q={}) {
  	


console.log('get httpppp',path)
  	  const response =
        await  fetch(path, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
    if (response.ok) { //status is 2xx
    console.log(response)
      return await response.json();
    }
    else { //return response errors
      return await response.json();
    }
    //TODO
  }

    /** Create handler for blur event on search-form input widgets.
     */
    setSearchHandler() {
    	  const id = this.shadowRoot.querySelector("#search-id")
    	  const hid = this.shadowRoot.querySelector("#search-holderId")
    	  
    	  id.addEventListener('blur' ,() => this.search())
 		  hid.addEventListener('blur', () => this.search())
    	  
    	  
    	  
    	  
    }

    /** Perform an accounts search.  If url is defined (it would be
     *  a scroll link), then simply perform a get() to that url.  If
     *  url is undefined, then searchAccounts() using the form-data
     *  from search-form.  If there are no errors, add the results
     *  to the results after the search form, including scroll controls
     *  before/after the actual results.  Then set up handlers for
     *  the just added scroll controls and the details link within
     *  each account result in the results.
     */
    async search(url=undefined) {
    	this.shadowRoot.querySelector('#search-results').innerHTML = ''
    	let acc;
    	if(url){
    		 acc =  await this.gethttp(url);
    	
    	}
    	else{
     	  const f = this.shadowRoot.querySelector("#search-form")
		  const d = new FormData(f)
        console.log(d)
        const formData = Object.fromEntries(d)
        console.log(formData)
        acc = await services.searchAccounts(formData);    	
		  console.log('search response ',acc)
          
    	}
    	if(acc.result.length!=0){
    		const scroll = makeScrollElement(acc.links);
			console.log(scroll)    		
			const navs = scroll.querySelectorAll("a")
			if(navs[0]){
							navs[0].addEventListener('click', ()=> this.search(navs[0].getAttribute('data-ws-href')))
			}
			if(navs[1]){
							navs[1].addEventListener('click', ()=> this.search(navs[1].getAttribute('data-ws-href')))
			}
			this.shadowRoot.querySelector('#search-results').append(scroll);
    		acc.result.map(a => {
				    			const elem = makeSearchResult(a.result.id,a.result.holderId,a.links[0].href)
								//console.log('elem',elem);
								const link = elem.querySelector("a")
								link.addEventListener('click', () => this.setDetails(link.getAttribute('data-ws-href')))
								this.shadowRoot.querySelector('#search-results').append(elem);
    			
    			
    			})
      }
      else{
			  this.shadowRoot.querySelector('#search-results').innerHTML = 'No results'    
      }
    }

    //TODO: add auxiliary methods as necessary

  };  //end of class expression for web component
  
} //end function makeAccountsClass



/** Always clears current error messages in sectionElement.  Then it
 *  report errors for result within sectionElement.  Returns true iff
 *  errors are reported.
 */
function reportErrors(result, sectionElement) {
  clearErrors(sectionElement);
  if (!result?.errors) return false;
  const errors = result.errors;
  const genErrors = sectionElement.querySelector('.errors');
  const errs = (errors instanceof Array) ? errors : [ errors ];
  for (const err of errs) {
    const msg = err.message ?? err.toString();
    const widget = err.options?.widget;
    if (widget) {
      const errElement =
	    sectionElement.querySelector(`[data-widget=${widget}]`);
      if (errElement) {
	errElement.innerHTML = msg;
	continue;
      }
    }
    genErrors.append(makeElement('li', {class: 'error'}, msg));	
  }
  return true;
}

/** Clear all errors in sectionElement */
function clearErrors(sectionElement) {
  const genErrors = sectionElement.querySelector('.errors');
  if (genErrors) genErrors.innerHTML = '';
  sectionElement.querySelectorAll('.error').forEach(e => {
    //clear all error messages in section
    e.innerHTML = '';
  });
}




