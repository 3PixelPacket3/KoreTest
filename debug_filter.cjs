const masterWorkItems = [{
    id: 'REQ-123',
    title: 'test',
    status: 'Open',
    priority: 'Medium',
    type: 'Unassigned',
    allocation: 'Unassigned'
}];

const fStatus = 'Active';
const fPriority = 'All';
const fType = 'All';
const fAlloc = 'All';
const searchQ = '';

const filtered = masterWorkItems.filter(item => {
    if(item.archived || item.deleted) return false;

    let statusMatch = (fStatus === 'All') || 
                      (fStatus === 'Active' && (item.status === 'Open' || item.status === 'In Progress')) || 
                      (item.status === fStatus);
    let prioMatch = (fPriority === 'All' || item.priority === fPriority);
    let typeMatch = (fType === 'All' || item.type === fType);
    let allocMatch = (fAlloc === 'All' || item.allocation === fAlloc);
    
    let searchMatch = true;

    return statusMatch && prioMatch && typeMatch && allocMatch && searchMatch;
});
console.log(filtered.length);
