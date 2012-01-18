<?php

/* The Chat class exploses public static methods, used by ajax.php */

class BLAM {
	// returns int Id, string Username, string Avatar, String Role or exception
	public static function login($name,$password){
		if(!empty($name) && !empty($password))
			{
			$user = new User(array(
				'username'	=> $name,
                'password'  => $password
				));
		
			// The login method returns a user array or false
            $result = $user->login();
            
			if($result !== false){
				// user is logged in succesfully
				$_SESSION['user']	= array(
                    'id'        => $result['id'],
                    'username'	=> $result['username'],
                    'role'      => $result['role'],
                    'avatar'	=> $result['avatar']
                );
			} else {
				//user is not logged in, destroy existing session and logout
                $user->logout();
				session_destroy();
                throw new Exception('Database error logging in.');
			}
		
			return $_SESSION['user'];
		}
		else{
            throw new Exception('Name and Password are required.');
		}
	}

    // returns string Username, string Avatar, String Role or exception
	public static function checkLogged() {
        // check if user is already logged in earlier?	
		if (isset($_SESSION['user'])) {
            $user = new user($_SESSION['user']);
            $user->activity();
        } else {
            throw new Exception('User not logged in.');
        }
		
		return $_SESSION['user'];
		
	}
	
	public static function logout() {
        $user = new User( isset($_SESSION['user']) ? $_SESSION['user'] : array() );
		$user->Logout();
        
		session_destroy();
	}
	
    // returns MessageId or exception
	public static function addMessage($text, $ticket = false){
		if(!isset($_SESSION['user'])){
			throw new Exception('You are not logged in');
		}
		
		if(empty($text)){
			throw new Exception('You haven\'t entered a message.');
		}
	
		$msg = new Message(array(
			'user_id'	=> $_SESSION['user']['id'],
			'text'	    => $text,
			'created'	=> date('Y-m-d G:i:s')
		));
	
		// The create method returns the new id
		$insertID = $msg->create();
        
        $tick_no = null;
        if ($ticket) {
            $wlticket = new Ticket(array(
                'message_id' => $insertID,
                'title' => 'NIEUW',
                'text' => $text,
                'status_id' => 1              
            ));
            
            $tick_no = $wlticket->create();
        }
        
        if ($tick_no) $msg->setTicket($tick_no);
        
		return array('id' => $insertID);
	}
    
    // returns MessageId or exception
	public static function updateMessage($id, $text){
		$msg = new Message(array(
			'id'	=> $id,
			'text'	    => $text
		));
	
		$msg->update();
        
		return array('id' => $msg->id);
	}
    public static function getMessages($msg_id, $date_and_time = null) {
        if (empty($msg_id)) {
            throw new Exception('No parameters given to getMessages');
        }
        
        $msg = new Message(array());
        
        if (is_string($msg_id) && $msg_id == 'all') {
            $messages = $msg->get('all');
        } else {
            $options = array(
                'last_id'   => $msg_id,
                'since'     => $date_and_time
            );
       
            $messages = $msg->get($options);
        }
        
        return $messages;
    }

    public static function searchMessages($keyword) {
        if (empty($keyword)) {
            throw new Exception('No keyword given to searchMessages');
        }
        
        $msg = new Message(array());
        $messages = $msg->search($keyword);
        
        return $messages;
    }

    // returns array (integer Id, string Role, string Username, string Avatar) users or exception
    public static function getUsers($options) {
        $user = new User(array());
        $users = $user->get($options);
        return $users;
    }

    // returns array(int groupid, string groupname, array(integer Id, integer HandleNumber, string HandleName, string description) handles) groups or exception
    public static function getGroups($recursive) {
        $group = new Group(array());
        $group_handles = $group->get($recursive); // true returns also handles;
        return $group_handles;
    }
    
    // returns array(integer Id, integer HandleNumber, string HandleName, string description) handles or exception
    public static function getHandles($group_id) {
        $handle = new Handle(array());
        $handles = $handle->get($group_id); // true returns also handles;
        return $handles;
    }

    public static function getTicketList($recursive, $last_id, $modified, $status) {
        $ticket = new Ticket(array());
        $tickets = $ticket->get($recursive, $last_id, $modified, $status);
        return $tickets;
    }

    // returns array (integer Id, string Title, string HandleName, string Message, string userWL, Datetime called, Datetime created)feedback or exception
    public static function getFeedback($id, $called) {
        $feedback = new Update(array());
        $feedbacks = $feedback->getFeedback($id, $called);
        return $feedbacks;
    }
    
    // returns array (id, ticket_id, type, title, message, handlename, called, called_by, created)
    public static function getUpdates($for, $type) {
        $updates = new Update(array());
        $updates = $updates->get($for, $type);
        return $updates;
    }
    
    public static function closeFeedback($id, $user_id){
        $feedback = new Update(array(
            'id'        => $id,
            'called_by' => $_SESSION['user']['id']
        ));
        $feedback->closeFeedback();
    }

    public static function addChat($text, $user_id){
        $chatline = new ChatLine(array(
                                    'text' => $text,
                                    'user_id' => $user_id
                                    ));
        $id = $chatline->create();
        return array('id' => $id);
    }

    public static function getChats($last_id, $date_and_time){
        $chatline = new ChatLine(array());
        $chats = $chatline->get($last_id, $date_and_time);
        return $chats;
    }

    public static function getTicketDetail($id){
        $ticket = new Ticket(array('id' => $id));
        $details = $ticket->getDetails();
        return $details;
    }

    public static function closeTicket($id){
        $ticket = new Ticket(array('id' => $id));
        $ticket->close();
    }

    public static function setTicketOwner($id){
        $ticket = new Ticket(array(
            'id' => $id,
            'user_id' => $_SESSION['user']['id']
        ));
        $ticket->setOwner();
    }

    public static function changeTicketOwner($id, $user_id){
        $ticket = new Ticket(array(
            'id'        => $id,
            'user_id'   => $user_id
        ));
        $ticket->setOwner();
    }

    public static function changeTicketDetails($id, $title, $text, $location, $solution, $reference, $handle_id){
        $ticket = new Ticket(array(
            'id'        => $id,
            'title'     => $title,
            'text'      => $text,
            'location'  => $location,
			'solution'  => $solution,
            'reference' => $reference,
            'handle_id' => $handle_id
        ));
        $ticket->update();
    }

    public static function createUpdate($ticket_id, $message){
        $update = new Update(array(
            'ticket_id' => $ticket_id,
			'type' => 'update',
            'message' => $message
        ));
        $id = $update->create();
        return $id;
    }

    public static function createFeedback($ticket_id, $message){
        $update = new Update(array(
            'ticket_id' => $ticket_id,
			'type' => 'feedback',
            'message' => $message
        ));
        $id = $update->create();
        return $id;
    }

    public static function becomeChildTicket($id, $parent_id){
        $ticket = new Ticket(array(
            'id'        => $id,
            'parent_id'   => $parent_id
        ));
        $ticket->becomeChild();
    }

    public static function becomeParentTicket($id){
        $ticket = new Ticket(array('id' => $id));
        $ticket->becomeParent();
    }
}