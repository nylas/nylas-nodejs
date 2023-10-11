# An iterative Java program to check if 
# two linked lists are identical or not 

# Linked list Node 


class Node: 
	def __init__(self, d): 
		self.data = d 
		self.next = None


class LinkedList: 
	def __init__(self): 
		self.head = None # head of list 

	# Returns true if linked lists a and b 
	# are identical, otherwise false 
	def areIdentical(self, listb): 
		a = self.head 
		b = listb.head 
		while (a != None and b != None): 
			if (a.data != b.data): 
				return False

			# If we reach here, then a and b 
			# are not null and their data is 
			# same, so move to next nodes 
			# in both lists 
			a = a.next
			b = b.next

		# If linked lists are identical, 
		# then 'a' and 'b' must be null 
		# at this point. 
		return (a == None and b == None) 

	# UTILITY FUNCTIONS TO TEST fun1() and fun2() 
	# Given a reference (pointer to pointer) to the 
	# head of a list and an int, push a new node on 
	# the front of the list. 

	def push(self, new_data): 

		# 1 & 2: Allocate the Node & 
		# Put in the data 
		new_node = Node(new_data) 

		# 3. Make next of new Node as head 
		new_node.next = self.head 

		# 4. Move the head to point to new Node 
		self.head = new_node 


# Driver Code 
if __name__ == "__main__": 
llist1 = LinkedList() 
llist2 = LinkedList() 

# The constructed linked lists are : 
# llist1: 3->2->1 
# llist2: 3->2->1 
llist1.push(1) 
llist1.push(2) 
llist1.push(3) 
llist2.push(1) 
llist2.push(2) 
llist2.push(3) 

# Function call 
if (llist1.areIdentical(llist2) == True): 
	print("Identical ") 
else: 
	print("Not identical ") 

# This code is contributed by Prerna Saini 
