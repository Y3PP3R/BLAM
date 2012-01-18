$(document).ready(function(){

  // Run the init method on document ready:

  ticketing.init();

});

var Timeout= new Array();

var ticketing = {

  // data holds variables for use in the class:

  data : {
    HandlelistVisible : 1,
    selectTicketLoaded : false,
  },

  // Init binds event listeners and sets up timers:

  init : function(){

    // Using the defaultText jQuery plugin, included at the bottom:
    $('#name').defaultText('Username');
    $('#password').defaultText('Password');

    // We use the working variable to prevent
    // multiple form submissions:

    var working = false;
    

    // Converting the #MeldingenList, #HandlesList divs into a jScrollPane,
    // and saving the plugin's API in logging.data:

    ticketing.data.jspAPIMeldingen = $('#MeldingenList').jScrollPane({
      verticalDragMinHeight: 12,
      verticalDragMaxHeight: 12
    }).data('jsp');

    ticketing.data.jspAPIChats = $('#WL-ChatList').jScrollPane({
      verticalDragMinHeight: 12,
      verticalDragMaxHeight: 12
    }).data('jsp');

    ticketing.data.jspAPIHandles = $('#HandlesList').jScrollPane({
            verticalDragMinHeight: 12,
            verticalDragMaxHeight: 12
    }).data('jsp');

    ticketing.data.jspAPINewTickets = $('#NewTicketsList').jScrollPane({
            verticalDragMinHeight: 12,
            verticalDragMaxHeight: 12
    }).data('jsp');

    ticketing.data.jspAPIOpenTickets = $('#OpenTicketsList').jScrollPane({
            verticalDragMinHeight: 12,
            verticalDragMaxHeight: 12
    }).data('jsp');

    ticketing.data.jspAPIClosedTickets = $('#ClosedTicketsList').jScrollPane({
            verticalDragMinHeight: 12,
            verticalDragMaxHeight: 12
      }).data('jsp');
               
      user = new User("TopBar");
      message = new Message(ticketing.data.jspAPIMeldingen);
      chat = new Chat(ticketing.data.jspAPIChats);
      handle = new Handle(ticketing.data.jspAPIHandles);
      ticketNew = new Ticket(ticketing.data.jspAPINewTickets,[{1: 'Nieuw'}]);
      ticketOpen = new Ticket(ticketing.data.jspAPIOpenTickets,[{1: 'Open'}]);
      ticketClosed = new Ticket(ticketing.data.jspAPIClosedTickets,[{1: 'Gesloten'}]);
      ticketSelect = new Ticket("",[{1: 'Open', 2: 'Nieuw', 3: 'Gesloten'}]);
      display = new Display ($('#TicketDetailsList'));
      updatefeedback = new UpdateAndFeedback("","");
      
      
        //function to implement clicking on ticket to get details
        $('div.list_item_parent_ticket_full').live('click', function(){
          if($(this).attr("id")!=ticketing.data.selectedticket)
            {
            ticketing.data.selectedticket=$(this).attr("id");
            ticketing.data.selectedparentticket=0;
            }
          display.showTicketDetail(ticketing.data.selectedticket,0);
        });

        //function to implement clicking on claim
        $('div.list_item_parent_ticket_claim').live('click', function(){
          $.tzPOST('setTicketOwner',{id:$(this).attr("id")},function(r){
          ticketing.reInitTickets("New")
          ticketing.reInitTickets("Open")
          });
        });

        //function to implement clicking on dynamic element ticket
        $('div.list_item_child_ticket').live('click', function(){
          if($(this).attr("id")!=ticketing.data.selectedticket)
            {
            ticketing.data.selectedticket=$(this).attr("id");
            ticketing.data.selectedparentticket=$(this).attr("title");
            }
          display.showTicketDetail(ticketing.data.selectedticket,$(this).attr("title"));
        });

        $('#handlelist_toggle_button').live('click', function(){
          if(!working)
          {
              working = true;
              if(ticketing.data.HandlelistVisible==1)
              {
              //$('#Handles').fadeOut();
              $('#Handles').css('display','none');
              $('#ChatContainer').css('left','0%');
              $('#ChatContainer').css('width','100%');
              $('#handlelist_toggle_button').attr('value','Roepnamenlijst aan');
              ticketing.data.HandlelistVisible=0;
              }
              else
              {
              //$('#Handles').fadeIn();
              $('#Handles').css('display','block');
              $('#ChatContainer').css('left','33%');
              $('#ChatContainer').css('width','65%');
              $('#handlelist_toggle_button').attr('value','Roepnamenlijst uit');
              ticketing.data.HandlelistVisible=1;
              }
              ticketing.reInitJSP();
              working=false;
          }
        });

        //function to implement clicking on dynamic element groups
        $('div.list_item_group').live('click', function(){
          if(!working)
          {
            working = true;
            var groupid=$(this).attr("id");
            if($(this).attr('visible')==0){
                $(this).attr('visible','1');
                $(".list_item_handle").each(function(i) {
                if($(this).hasClass(groupid))
                  {
                  $(this).fadeIn();

                  }
                });
            }
            else
            {
                $(this).attr('visible','0');
                $(".list_item_handle").each(function(i) {
                if($(this).hasClass(groupid))
                  {
                  $(this).fadeOut();
                  }
                });
            }

            working=false;
          }
          //ticketing.data.jspAPIHandles.getContentPane().append('<div class=test></div>');
          //ticketing.data.jspAPIHandles.reinitialise();
          //$('#HandlesList .test').remove();
          ticketing.data.jspAPIHandles.reinitialise();
        });

        $('#search_handles').keyup(function (e) {
						handle.searchHandles($('#search_handles').val());
        });

				//function to implement clicking on select ticket (in ticketdetail
				$('#become_Ticket').live('click', function()
				{
									if(ticketing.data.selectTicketLoaded == false && ticketing.data.selectedparentticket==0)
									{			    	
					    		ticketSelect.fillTicket($('#become_Ticket'),ticketing.data.selectedticket,ticketing.data.selectedparentticket);			
					    		ticketing.data.selectTicketLoaded = true;
					    		}
				});

        //function to implement clicking on thickbox link
        $('#openmodalbutton').live('click', function(){
          general.tb_open_new('UpdatesAndFeedbacks.html?&KeepThis=true&height=500&width=800');
        });

        // Logging a person into blam:
        $('#loginForm').submit(function(){
            if(working) return false;
            working = true;
            // Using our tzPOST wrapper function (defined in the bottom):
            //$(this).serialize encodes all the name form elements to be used by php
            $.tzPOST('login',$(this).serialize(),function(r){
                working = false;

                if(r.error){
                    general.displayError(r.error);
                }
                else
                {
                    ticketing.login(r.username,r.avatar,r.role);
                }
            });
            return false;
        });

        // Checking whether the user is already logged (browser refresh)
        $.tzPOST('checkLogged',function(r){
            if(!r.error)
            {
                ticketing.login(r.username,r.avatar,r.role);
            }
        });

        // Logging the user out:
        $('a.logoutButton').live('click',function(){
            ticketing.killTimeouts();
            $('#TopContainer > span').fadeOut(function(){
                $(this).remove();
            });

            $('#TopContainer').fadeOut();
            $('#MainContainer').fadeOut(function(){
                $('#Login').fadeIn();
            });
            $.tzPOST('logout');
            return false;
        });

        // Submitting a new chat entry:
        $('#submitForm').submit(function(){
            var text = $('#Chattext').val();
            if(text.length == 0){
                return false;
            }
            if(working) return false;
            working = true;
            chat.submitChat(text);
            working = false;
            return false;
        });

      // add listener for this button and change ticket details
      $('#saveticketbutton').live('click',function(){
            $.tzPOST('changeTicketDetails',{id:ticketing.data.selectedticket,title:$('#ticket_title').val(),text:$('#ticket_text').val(),location:$('#ticket_location').val(),solution:$('#ticket_oplossing').val(),handle_id:$('#ticket_Handle').val(),reference:$('#ticket_reference').val()},function(r){
              if(r==null){

              }
              else
              {
                general.displayError(r.error);
              }
            });

            if(!($('div .list_item_ticketdetail_status').text()=="status: Nieuw") && !($('div .list_item_ticketdetail_status').text()=="status: Subticket")){
              $.tzPOST('changeTicketOwner',{id:ticketing.data.selectedticket,user_id:$('#owner').val()},function(r){
                if(r==null){

                }
                else
                {
                  general.displayError(r.error);
                }
              });
            }
            ticketing.reInitTickets("All");
            general.displaySaved("Saved Ticket: " + $('#ticket_title').val());
            setTimeout("ticketing.getTicketDetail(ticketing.data.selectedticket,0);",500);
      });

      // add listener for this button and change ticket details
      $('#closeticketbutton').live('click',function(){
              $.tzPOST('changeTicketDetails',{id:ticketing.data.selectedticket,title:$('#ticket_title').val(),text:$('#ticket_text').val(),location:$('#ticket_location').val(),solution:$('#ticket_oplossing').val(),handle_id:$('#ticket_Handle').val(),reference:$('#ticket_reference').val()},function(r){
              if(r==null){

              }
              else
              {
                general.displayError(r.error);
              }
            });

            if(!($('div .list_item_ticketdetail_status').text()=="status: Nieuw") && !($('div .list_item_ticketdetail_status').text()=="status: Subticket")){
              $.tzPOST('changeTicketOwner',{id:ticketing.data.selectedticket,user_id:$('#owner').val()},function(r){
                if(r==null){

                }
                else
                {
                  general.displayError(r.error);
                }
              });
            }


            $.tzPOST('closeTicket',{id:ticketing.data.selectedticket},function(r){
              if(r==null){

              }
              else
              {
                general.displayError(r.error);
              }
            });
            ticketing.reInitTickets("Open");
            ticketing.reInitTickets("Closed");
            general.displaySaved("Saved Ticket: " + $('#ticket_title').val());
            $('#TicketDetailsList').empty();
            });

      // add listener for this button and change to childticket of certain parentticket
      $('#childticketbutton').live('click',function(){
            $.tzPOST('becomeChildTicket',{id:ticketing.data.selectedticket,parent_id:$('#become_Ticket').val()},function(r){
              if(r==null){

              }
              else
              {
                general.displayError(r.error);
              }
            });
            ticketing.reInitTickets("All");
            $('#TicketDetailsList').empty();
      });

      // add listener for this button and change to parentticket
      $('#becomeparentticketbutton').live('click',function(){
            $.tzPOST('becomeParentTicket',{id:ticketing.data.selectedticket},function(r){
              if(r==null){

              }
              else
              {
                general.displayError(r.error);
              }
            });
            ticketing.reInitTickets("All");
            $('#TicketDetailsList').empty();
      });

      // add listener for this button and add an update
      $('#saveupdatebutton').live('click',function(){
        if(working) return false;
        working = true;
        if($('#ticket_update').val()!="" && $('#ticket_update').val()!="Text voor update")
          {
            $.tzPOST('createUpdate',{ticket_id:ticketing.data.selectedticket,message:$('#ticket_update').val()},function(r){
              working = false;
              if(r.error){
                    general.displayError(r.error);
                  }
                  else
                  {
                    general.displaySaved("Update aangemaakt: " + $('#ticket_title').val());
                    $('#ticket_update').val("");
                    $('#ticket_update').defaultText('Text voor update');
                    ticketing.TicketDetailUpdates(ticketing.data.selectedticket);
                  }

            });
          }
          else
                {
                alert("Niet goed ingevuld!");
                working = false;
                }
          return false;
      });


        $('#savefeedbackbutton').live('click',function(){
            if(working) return false;
            working = true;
                if($('#ticket_feedback').val()!="" && $('#ticket_feedback').val()!="Text voor terugmelding")
                {
                  $.tzPOST('createFeedback',{ticket_id:ticketing.data.selectedticket,title:$('#ticket_title').val(),message:$('#ticket_feedback').val()},function(r){
                    working = false;
                    if(r.error){
                        general.displayError(r.error);
                    }
                    else
                    {
                        general.displaySaved("Terugmelding aangemaakt: " + $('#ticket_title').val());
                        $('#ticket_feedback').val("");
                        $('#ticket_feedback').defaultText('Text voor terugmelding');
                        ticketing.TicketDetailUpdates(ticketing.data.selectedticket);
                    }
                  });
                }
                else
                {
                alert("Niet goed ingevuld!");
                working = false;
                }
          return false;
        });

        //catching window resizes
        var resizeTimer = null;
        $(window).bind('resize', function() {
        if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(ticketing.reInitJSP,100);
        });

  },
  /*-------------------------------------*/
  /*             END OF INIT             */
  /*-------------------------------------*/

    // The login method hides displays the
    // user's login data and shows the submit form
    login : function(username,avatar,role){
        //replace empty avatar filed
        var new_avatar=avatar;
        if((avatar=="") || (avatar=="NULL")|| (avatar==null))
        {
        new_avatar="unknown30x30.png";
        }
        user.setUser(username,new_avatar,role);
        $('#TopContainer').html(general.render('ticketing-loginTopBar',ticketing.data));
        $('#Login').fadeOut(function(){
          $('#MainContainer').fadeIn();
          $('#TopContainer').fadeIn();
          message.getMessages();
          chat.getChats();
          user.getUsers();
          handle.getHandles();
          ticketNew.getTickets();
          ticketOpen.getTickets();
          ticketClosed.getTickets();
        });
    },

    TicketDetailTickets : function(ticketstatus,ticket_id,parent_id){
    
    },

  killTimeouts : function(){
            for (key in Timeout)
            {
              clearTimeout(Timeout[key]);
            }
  },

  reInitTickets : function(type){

      switch(type){

        case 'New':
          window.clearTimeout(Timeout["NewTickets"]);
          setTimeout("ticketNew.getTickets();",500);
        break;

        case 'Open':
          window.clearTimeout(Timeout["OpenTickets"]);
          setTimeout("ticketOpen.getTickets();",500);
        break;

        case 'Closed':
          window.clearTimeout(Timeout["ClosedTickets"]);
          setTimeout("ticketClosed.getTickets();",500);
        break;

        case 'All':
          window.clearTimeout(Timeout["NewTickets"]);
          setTimeout("ticketNew.getTickets();",500);
          window.clearTimeout(Timeout["OpenTickets"]);
          setTimeout("ticketOpen.getTickets();",500);
          window.clearTimeout(Timeout["ClosedTickets"]);
          setTimeout("ticketClosed.getTickets();",500);
        break;
      }
  },

  reInitJSP : function(){
            ticketing.data.jspAPIMeldingen.reinitialise();
            ticketing.data.jspAPIChats.reinitialise();
            ticketing.data.jspAPIHandles.reinitialise();
            ticketing.data.jspAPINewTickets.reinitialise();
            ticketing.data.jspAPIOpenTickets.reinitialise();
            ticketing.data.jspAPIClosedTickets.reinitialise();
  }

};
