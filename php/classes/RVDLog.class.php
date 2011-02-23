<?php

/* The Chat class exploses public static methods, used by ajax.php */

class RVDLog {
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
			if(result !== false){
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
            $user = $_SESSION['user'];
        } else {
            throw new Exception('User not logged in.');
        }
		
		return $user;
		
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
			'created'	=> now()
		));
	
		// The save method returns a MySQLi object
		$insertID = $msg->create()->insert_id;
        
		return $insertID;
	}

    public static function getMessages($msg_id, $date_and_time) {
    
    }

    public static function searchMessages($keyword) {
    
    }

    public static function getUsers() {
        return array();
    }

    public static function getHandles() {
    
    }

    public static function getTicketList() {
    
    }

    public static function getFeedback() {
    
    }

    public static function closeFeedback($id){
    
    }

    public static function addChat($text){
    
    }

    public static function getChats($last_id, $date_and_time){
        return array();
    
    }

    public static function getTicketTreeNew($text, $ticket = false){
    
    }

    public static function getTicketTreeOpen($text, $ticket = false){
    
    }

    public static function getTicketTreeClosed($text, $ticket = false){
    
    }

    public static function getTicketDetail($id){
    
    }

    public static function closeTicket($id){
    
    }

    public static function setTicketOwner($id){
    
    }

    public static function changeTicketOwner($id, $user_id){
    
    }

    public static function changeTicketDetails($id, $title, $text, $location, $handle_id){
    
    }

    public static function createSubTicket($parent_id, $text, $location, $handle_id){
    
    }

    public static function becomeChildTicket($id, $parent_id){
    
    }

    public static function becomeParentTicket($id){
    
    }

    public static function createFeedback($ticket_id, $text, $handle_id){
    
    }
}