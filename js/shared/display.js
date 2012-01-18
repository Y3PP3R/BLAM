function Display (pane) {
	//constructor
	var self = this;
	var pane = pane;
		
		this.showTicketDetail = function(ticket_id,parent_id){
				//main function that displays the ticketdetails
        $.tzPOST('getTicketDetail',{id: ticket_id},function(r){
          if(r){
            if(!r.error)
                {
                    //$('#TicketDetailsList').empty();
                    pane.empty();
                    if(parent_id==0){

                      switch(r[0].status){
                        case 'Nieuw':
                          //$('#TicketDetailsList').html();
                          
                          pane.html(general.render('ticket_detail_new',r[0]));
                        break;
                        case 'Open':
                          pane.html(general.render('ticket_detail_open',r[0]));
                        break;
                        case 'Gesloten':
                          pane.html(general.render('ticket_detail_closed',r[0]));
                        break;

                      }
                    }
                    else
                    {
                          r[0].status="Subticket";
                          pane.html(general.render('subticket_detail',r[0]));
                    }

                    $('#ticket_update').defaultText('Text voor update');
                    $('#ticket_feedback').defaultText('Text voor terugmelding');

                    user.fillSelect($('#owner'),r[0].wluser);
                    handle.fillHandle(r[0].handle_id,$('#ticket_Handle'));
                    ticketing.TicketDetailTickets(r[0].status,ticket_id,parent_id);
                    ticketing.data.selectTicketLoaded=false;
                    
                    if(r[0].status!='Subticket'){
                    	$('#become_Ticket').attr('options')[0] = new Option("selecteer ticket");
                    	updatefeedback.fillUpdate(ticket_id,$('p.list_item_ticketdetail_label_last_update'),$('#ticket_last_update'));
                    	updatefeedback.fillFeedback(ticket_id,$('p.list_item_ticketdetail_label_last_feedback'),$('#ticket_last_feedback'));
                    }
                    else
                    {
                  		ticketSelect.fillTicket($('#become_Ticket'),ticketing.data.selectedticket,ticketing.data.selectedparentticket);	
                  	}
          
                }
            else
                {
                    general.displayError(r.error);
                }
          }
          else
          {
            pane.html('<p>Invalid ticket selected, please contact your local admin!</p>');
          }
        });		
		};
		
 		this.showTicket = function(ticket_id){
		
				$.tzPOST('getTicketDetail',{id: ticket_id},function(r){
            if(!r.error)
                {
                	pane.getContentPane().empty();
                	markup_extra=general.render('parentticket_expanded',r[0]);
                  pane.getContentPane().append(markup_extra);
                  pane.reinitialise();
              	}
        });	
	  };
	  
	  this.showOpenFeedback = function(feedback_id){
				$.tzPOST('getFeedback',{id:feedback_id,called: 'false'},function(r){
            if(!r.error)
                {
                	pane.getContentPane().empty();
                	markup_extra=general.render('openfeedback_expanded',r[0]);
                	pane.getContentPane().append(markup_extra);
                	pane.reinitialise();
              	}
        });	
	  };
	  
	  this.showClosedFeedback = function(feedback_id){
				$.tzPOST('getFeedback',{id:feedback_id,called: 'true'},function(r){
            if(!r.error)
                {
                	pane.getContentPane().empty();
                	markup_extra=general.render('closedfeedback_expanded',r[0]);
                	pane.getContentPane().append(markup_extra);
                	pane.reinitialise();
              	}
        });	
	  };
	  
	  this.clearDisplay = function(){
				pane.getContentPane().empty();
				pane.reinitialise();
	  };
	  	  
}