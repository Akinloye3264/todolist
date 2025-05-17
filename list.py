def descending_order(lst):
    """
    Sorts a list in descending order using the bubble sort algorithm.
    
    Parameters:
    lst (list): The list to be sorted.
    
    Returns:
    list: The sorted list in descending order.
    """
    n = len(lst)
    for i in range(n):
        for j in range(0, n-i-1):
            if lst[j] < lst[j+1]:
                lst[j], lst[j+1] = lst[j+1], lst[j]
    return lst